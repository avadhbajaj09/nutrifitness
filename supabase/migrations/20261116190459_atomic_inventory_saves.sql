-- Reviewed stock remediation. Apply to staging first; no production data backfill.
BEGIN;

-- Ensure the conflict target used by the application also handles parent NULL variants.
CREATE UNIQUE INDEX IF NOT EXISTS product_stock_identity_v2
  ON public.product_stock (product_id, variant_id, origin_id) NULLS NOT DISTINCT;

CREATE TABLE IF NOT EXISTS public.stock_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  variant_id uuid,
  origin_id text NOT NULL,
  old_quantity integer,
  new_quantity integer,
  old_active boolean,
  new_active boolean,
  actor text NOT NULL,
  source text NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  transaction_id bigint NOT NULL DEFAULT txid_current()
);
CREATE INDEX IF NOT EXISTS stock_change_log_product_time ON public.stock_change_log(product_id, changed_at DESC);
ALTER TABLE public.stock_change_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stock_change_log FROM anon, authenticated;
GRANT SELECT, INSERT ON public.stock_change_log TO service_role;

CREATE OR REPLACE FUNCTION public.log_inventory_change() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.quantity, OLD.is_active) IS NOT DISTINCT FROM (NEW.quantity, NEW.is_active) THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.stock_change_log(product_id, variant_id, origin_id, old_quantity, new_quantity,
    old_active, new_active, actor, source)
  VALUES (COALESCE(NEW.product_id, OLD.product_id), COALESCE(NEW.variant_id, OLD.variant_id),
    COALESCE(NEW.origin_id, OLD.origin_id),
    CASE WHEN TG_OP <> 'INSERT' THEN OLD.quantity END,
    CASE WHEN TG_OP <> 'DELETE' THEN NEW.quantity END,
    CASE WHEN TG_OP <> 'INSERT' THEN OLD.is_active END,
    CASE WHEN TG_OP <> 'DELETE' THEN NEW.is_active END,
    COALESCE(NULLIF(current_setting('nutrifitness.actor', true), ''), session_user),
    COALESCE(NULLIF(current_setting('nutrifitness.source', true), ''), 'direct_database_write'));
  RETURN COALESCE(NEW, OLD);
END $$;
DROP TRIGGER IF EXISTS inventory_change_audit ON public.product_stock;
CREATE TRIGGER inventory_change_audit AFTER INSERT OR UPDATE OR DELETE ON public.product_stock
  FOR EACH ROW EXECUTE FUNCTION public.log_inventory_change();

-- Preserve the known product serializer, but never expose its unguarded entrypoint.
DO $$ BEGIN
  IF to_regprocedure('public.save_admin_product_full_legacy(jsonb)') IS NULL THEN
    ALTER FUNCTION public.save_admin_product_full(jsonb) RENAME TO save_admin_product_full_legacy;
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.save_admin_product_full_legacy(jsonb) FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.save_admin_product_full_legacy(jsonb) SECURITY INVOKER;
ALTER FUNCTION public.save_admin_product_full_legacy(jsonb) SET search_path = public, pg_temp;

-- Both full and partial edits lock the same product and reject stale editor snapshots.
CREATE OR REPLACE FUNCTION public.save_inventory_product(payload jsonb, mode text, actor text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE
  p public.products%ROWTYPE;
  v public.product_variants%ROWTYPE;
  merged jsonb;
  variants jsonb := '[]'::jsonb;
  patch jsonb;
  elem jsonb;
  result jsonb;
  origin text;
  field text;
  old_stock jsonb;
  is_variable boolean;
BEGIN
  IF mode NOT IN ('full','patch') OR NULLIF(actor,'') IS NULL THEN
    RAISE EXCEPTION 'Invalid inventory command' USING ERRCODE='22023';
  END IF;
  PERFORM set_config('nutrifitness.actor',actor,true);
  PERFORM set_config('nutrifitness.source','admin_' || mode,true);
  SELECT * INTO p FROM public.products WHERE id::text=payload->>'id'
    OR woo_id=regexp_replace(payload->>'id','^prod-','') OR slug=payload->>'id' OR sku=payload->>'id'
    ORDER BY (id::text=payload->>'id') DESC LIMIT 1 FOR UPDATE;
  IF p.id IS NULL AND mode='patch' THEN RAISE EXCEPTION 'Produit introuvable' USING ERRCODE='P0002'; END IF;
  IF p.id IS NOT NULL THEN
    IF payload->>'expected_updated_at' IS NULL OR (payload->>'expected_updated_at')::timestamptz IS DISTINCT FROM p.updated_at THEN
      RAISE EXCEPTION 'Ce produit a été modifié. Rechargez-le avant d’enregistrer.' USING ERRCODE='40001';
    END IF;
    SELECT COALESCE(jsonb_agg(to_jsonb(s)), '[]'::jsonb) INTO old_stock FROM public.product_stock s WHERE product_id=p.id;
    SELECT EXISTS(SELECT 1 FROM public.product_variants WHERE product_id=p.id) INTO is_variable;
    IF mode='patch' AND is_variable AND (payload ? 'stock_geneva' OR payload ? 'stock_portugal') THEN
      RAISE EXCEPTION 'Modifiez le stock de chaque variante, pas le total du produit.' USING ERRCODE='22023';
    END IF;
    merged := to_jsonb(p) || payload || jsonb_build_object('id',p.id);
    FOR v IN SELECT * FROM public.product_variants WHERE product_id=p.id ORDER BY id LOOP
      IF mode='patch' AND payload->>'delete_variant_id'=v.id::text THEN CONTINUE; END IF;
      IF mode='full' AND payload ? 'variants' THEN
        SELECT value INTO patch FROM jsonb_array_elements(payload->'variants')
          WHERE value->>'id'=v.id::text OR value->>'sku'=v.sku OR value->>'flavor'=v.attribute_value LIMIT 1;
        IF patch IS NULL THEN CONTINUE; END IF;
      ELSE
        SELECT value INTO patch FROM jsonb_array_elements(COALESCE(payload->'variants','[]'::jsonb))
          WHERE value->>'id'=v.id::text LIMIT 1;
      END IF;
      elem := to_jsonb(v) || jsonb_build_object('flavor',v.attribute_value,'image',v.image_url) || COALESCE(patch,'{}'::jsonb);
      variants := variants || jsonb_build_array(elem);
    END LOOP;
    -- Never accept a variant UUID belonging to another product, including delete commands.
    IF mode='patch' THEN
      FOR elem IN SELECT value FROM jsonb_array_elements(COALESCE(payload->'variants','[]'::jsonb)) LOOP
        IF NOT EXISTS(SELECT 1 FROM public.product_variants WHERE id::text=elem->>'id' AND product_id=p.id) THEN
          RAISE EXCEPTION 'Variante introuvable pour ce produit.' USING ERRCODE='22023';
        END IF;
      END LOOP;
      IF payload ? 'delete_variant_id' AND NOT EXISTS(SELECT 1 FROM public.product_variants WHERE id::text=payload->>'delete_variant_id' AND product_id=p.id) THEN
        RAISE EXCEPTION 'Variante introuvable pour ce produit.' USING ERRCODE='22023';
      END IF;
      IF payload ? 'add_variant' THEN variants := variants || jsonb_build_array(payload->'add_variant'); END IF;
    ELSE
      FOR elem IN SELECT value FROM jsonb_array_elements(COALESCE(payload->'variants','[]'::jsonb)) LOOP
        IF NOT EXISTS(SELECT 1 FROM public.product_variants WHERE product_id=p.id AND
          (id::text=elem->>'id' OR sku=elem->>'sku' OR attribute_value=elem->>'flavor')) THEN
          IF EXISTS(SELECT 1 FROM public.product_variants WHERE id::text=elem->>'id' AND product_id<>p.id) THEN
            RAISE EXCEPTION 'Variante appartenant à un autre produit.' USING ERRCODE='22023';
          END IF;
          variants := variants || jsonb_build_array(elem);
        END IF;
      END LOOP;
    END IF;
    merged := merged || jsonb_build_object('variants',variants);
    -- Empty/full variant deletion must be explicit, not an omitted field.
    IF mode='full' AND payload ? 'variants' AND jsonb_array_length(payload->'variants')=0 AND is_variable THEN
      RAISE EXCEPTION 'Supprimez les variantes explicitement avant de convertir le produit.' USING ERRCODE='22023';
    END IF;
  ELSE
    merged := payload;
  END IF;
  FOR elem IN SELECT value FROM jsonb_array_elements(COALESCE(merged->'variants','[]'::jsonb)) UNION ALL SELECT merged LOOP
    FOREACH field IN ARRAY ARRAY['stock_geneva','stock_portugal'] LOOP
      IF elem ? field AND (jsonb_typeof(elem->field)<>'number' OR (elem->>field)::numeric<0 OR
          (elem->>field)::numeric<>trunc((elem->>field)::numeric)) THEN
        RAISE EXCEPTION 'La quantité doit être un entier positif ou zéro.' USING ERRCODE='22023';
      END IF;
    END LOOP;
  END LOOP;
  result := public.save_admin_product_full_legacy(merged || jsonb_build_object('user',actor));
  IF p.id IS NOT NULL THEN
    -- Preserve activation on metadata/location edits. A location is not a stock transfer.
    UPDATE public.product_stock s SET is_active=(old.value->>'is_active')::boolean
    FROM jsonb_array_elements(old_stock) old(value)
    WHERE s.product_id=p.id AND s.variant_id IS NOT DISTINCT FROM (old.value->>'variant_id')::uuid
      AND s.origin_id=old.value->>'origin_id' AND s.is_active IS DISTINCT FROM (old.value->>'is_active')::boolean;
    -- Explicit activation applies to the whole origin, without destroying quantities.
    FOREACH origin IN ARRAY ARRAY['GENEVA','PORTUGAL'] LOOP
      field := CASE WHEN origin='GENEVA' THEN 'is_geneva_active' ELSE 'is_portugal_active' END;
      IF payload ? field OR payload->>'toggle_location'=origin THEN
        UPDATE public.product_stock s SET is_active=CASE WHEN payload ? field THEN (payload->>field)::boolean
          ELSE NOT COALESCE((SELECT (x->>'is_active')::boolean FROM jsonb_array_elements(old_stock) x
            WHERE x->>'origin_id'=origin AND x->>'variant_id' IS NULL LIMIT 1),true) END
        WHERE s.product_id=p.id AND s.origin_id=origin;
      END IF;
    END LOOP;
    -- Legacy serializer only deletes removed variants when at least one is retained.
    IF mode='patch' AND payload ? 'delete_variant_id' THEN
      DELETE FROM public.product_stock WHERE product_id=p.id AND variant_id::text=payload->>'delete_variant_id';
      DELETE FROM public.product_variants WHERE product_id=p.id AND id::text=payload->>'delete_variant_id';
    END IF;
  END IF;
  UPDATE public.products SET updated_at=clock_timestamp() WHERE id=(result->>'id')::uuid RETURNING updated_at INTO p.updated_at;
  RETURN result || jsonb_build_object('updated_at',p.updated_at);
END $$;

-- Old deployed callers fail closed rather than silently overwriting new stock.
CREATE OR REPLACE FUNCTION public.save_admin_product_full(payload jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
BEGIN
  RETURN public.save_inventory_product(payload,'full','legacy_admin_unverified');
END $$;
REVOKE ALL ON FUNCTION public.save_inventory_product(jsonb,text,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.save_admin_product_full(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_inventory_product(jsonb,text,text), public.save_admin_product_full(jsonb), public.save_admin_product_full_legacy(jsonb) TO service_role;
CREATE TABLE IF NOT EXISTS public.inventory_commands (
  command_key text PRIMARY KEY,
  request jsonb NOT NULL,
  result jsonb NOT NULL
);
ALTER TABLE public.inventory_commands ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.inventory_commands FROM anon,authenticated;
GRANT SELECT,INSERT ON public.inventory_commands TO service_role;

CREATE OR REPLACE FUNCTION public.adjust_inventory(payload jsonb, actor text) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE
  p public.products%ROWTYPE;
  v public.product_variants%ROWTYPE;
  command jsonb;
  quantities jsonb := '{}'::jsonb;
  prior public.inventory_commands%ROWTYPE;
  origin text;
  field text;
  current_qty integer;
  next_qty numeric;
  result jsonb;
  hint text := COALESCE(payload->>'variantId',payload->>'variantSku',payload->>'attributeValue',payload->>'flavor',payload->>'flavorName');
BEGIN
  IF (payload ? 'quantity') = (payload ? 'delta') OR COALESCE(payload->>'origin','GENEVA') NOT IN ('GENEVA','PORTUGAL','ALL') THEN
    RAISE EXCEPTION 'Invalid inventory command' USING ERRCODE='22023';
  END IF;
  SELECT * INTO p FROM public.products WHERE id::text=payload->>'productId' OR
    woo_id=regexp_replace(payload->>'productId','^prod-','') OR sku=payload->>'productId' OR slug=payload->>'productId'
    ORDER BY (id::text=payload->>'productId') DESC LIMIT 1 FOR UPDATE;
  IF p.id IS NULL THEN RAISE EXCEPTION 'Produit introuvable' USING ERRCODE='P0002'; END IF;
  IF payload ? 'delta' AND NULLIF(payload->>'idempotency_key','') IS NULL THEN
    RAISE EXCEPTION 'Identifiant de mouvement requis' USING ERRCODE='22023';
  END IF;
  IF payload ? 'idempotency_key' THEN
    PERFORM pg_advisory_xact_lock(hashtextextended(payload->>'idempotency_key',0));
    SELECT * INTO prior FROM public.inventory_commands WHERE command_key=payload->>'idempotency_key';
    IF FOUND THEN
      IF prior.request IS DISTINCT FROM payload THEN RAISE EXCEPTION 'Identifiant de mouvement réutilisé' USING ERRCODE='22023'; END IF;
      RETURN prior.result;
    END IF;
  END IF;
  IF payload ? 'quantity' AND (payload->>'expected_updated_at' IS NULL OR
      (payload->>'expected_updated_at')::timestamptz IS DISTINCT FROM p.updated_at) THEN
    RAISE EXCEPTION 'Stock modifié ailleurs' USING ERRCODE='40001';
  END IF;
  IF hint IS NOT NULL THEN
    SELECT * INTO v FROM public.product_variants WHERE product_id=p.id AND
      (id::text=regexp_replace(hint,'^var-','') OR sku=hint OR woo_id=regexp_replace(hint,'^var-','') OR lower(attribute_value)=lower(hint))
      ORDER BY (id::text=hint) DESC LIMIT 1;
    IF v.id IS NULL THEN RAISE EXCEPTION 'Variante introuvable' USING ERRCODE='22023'; END IF;
  ELSIF EXISTS(SELECT 1 FROM public.product_variants WHERE product_id=p.id) THEN
    RAISE EXCEPTION 'Variante requise' USING ERRCODE='22023';
  END IF;
  FOREACH origin IN ARRAY CASE WHEN payload->>'origin'='ALL' THEN ARRAY['GENEVA','PORTUGAL'] ELSE ARRAY[COALESCE(payload->>'origin','GENEVA')] END LOOP
    SELECT quantity INTO current_qty FROM public.product_stock WHERE product_id=p.id AND variant_id IS NOT DISTINCT FROM v.id AND origin_id=origin;
    next_qty := CASE WHEN payload ? 'quantity' THEN (payload->>'quantity')::numeric ELSE COALESCE(current_qty,0)+(payload->>'delta')::numeric END;
    IF next_qty IS NULL OR next_qty<0 OR next_qty<>trunc(next_qty) OR
      jsonb_typeof(COALESCE(payload->'quantity',payload->'delta'))<>'number' THEN
      RAISE EXCEPTION 'Stock insuffisant ou quantité invalide' USING ERRCODE='22023';
    END IF;
    field := CASE WHEN origin='GENEVA' THEN 'stock_geneva' ELSE 'stock_portugal' END;
    quantities := quantities || jsonb_build_object(field,next_qty);
  END LOOP;
  command := jsonb_build_object('id',p.id,'expected_updated_at',p.updated_at);
  IF v.id IS NULL THEN command := command || quantities;
  ELSE command := command || jsonb_build_object('variants',jsonb_build_array(quantities || jsonb_build_object('id',v.id))); END IF;
  result := public.save_inventory_product(command,'patch',actor);
  SELECT * INTO p FROM public.products WHERE id=p.id;
  result := result || jsonb_build_object('productId',p.id,'wooId',p.woo_id,'stockGeneva',p.stock_geneva,
    'stockPortugal',p.stock_portugal,'totalStock',p.stock_geneva+p.stock_portugal,'inStock',p.stock_geneva+p.stock_portugal>0);
  IF payload ? 'idempotency_key' THEN INSERT INTO public.inventory_commands VALUES(payload->>'idempotency_key',payload,result); END IF;
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.adjust_inventory(jsonb,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_inventory(jsonb,text) TO service_role;
COMMIT;

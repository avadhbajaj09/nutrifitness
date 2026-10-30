-- Migration 005: Single Source of Truth for Inventory & Atomic Product Save RPC

-- 1. Trigger to keep products.stock_* and product_variants.stock_* perfectly synchronized from product_stock
CREATE OR REPLACE FUNCTION sync_product_stock_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_prod_id UUID;
  v_var_id UUID;
  v_origin TEXT;
  v_total_geneva INT;
  v_total_portugal INT;
BEGIN
  -- Prevent trigger recursion if called from another trigger
  IF pg_trigger_depth() > 2 THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'DELETE' THEN
    v_prod_id := OLD.product_id;
    v_var_id := OLD.variant_id;
    v_origin := OLD.origin_id;
  ELSE
    v_prod_id := NEW.product_id;
    v_var_id := NEW.variant_id;
    v_origin := NEW.origin_id;
  END IF;

  -- A. Sync variant stock if this record is for a variant
  IF v_var_id IS NOT NULL THEN
    IF TG_OP = 'DELETE' THEN
      UPDATE product_variants
      SET 
        stock_geneva = COALESCE((SELECT quantity FROM product_stock WHERE variant_id = v_var_id AND origin_id = 'GENEVA' AND is_active = true), 0),
        stock_portugal = COALESCE((SELECT quantity FROM product_stock WHERE variant_id = v_var_id AND origin_id = 'PORTUGAL' AND is_active = true), 0),
        updated_at = NOW()
      WHERE id = v_var_id;
    ELSE
      IF NEW.origin_id = 'GENEVA' THEN
        UPDATE product_variants
        SET stock_geneva = NEW.quantity, updated_at = NOW()
        WHERE id = v_var_id;
      ELSIF NEW.origin_id = 'PORTUGAL' THEN
        UPDATE product_variants
        SET stock_portugal = NEW.quantity, updated_at = NOW()
        WHERE id = v_var_id;
      END IF;
    END IF;
  END IF;

  -- B. Sync parent product stock totals
  IF EXISTS (SELECT 1 FROM product_variants WHERE product_id = v_prod_id) THEN
    SELECT 
      COALESCE(SUM(CASE WHEN origin_id = 'GENEVA' AND is_active = true THEN quantity ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN origin_id = 'PORTUGAL' AND is_active = true THEN quantity ELSE 0 END), 0)
    INTO v_total_geneva, v_total_portugal
    FROM product_stock
    WHERE product_id = v_prod_id AND variant_id IS NOT NULL;
  ELSE
    SELECT 
      COALESCE(MAX(CASE WHEN origin_id = 'GENEVA' AND is_active = true THEN quantity ELSE 0 END), 0),
      COALESCE(MAX(CASE WHEN origin_id = 'PORTUGAL' AND is_active = true THEN quantity ELSE 0 END), 0)
    INTO v_total_geneva, v_total_portugal
    FROM product_stock
    WHERE product_id = v_prod_id AND variant_id IS NULL;
  END IF;

  UPDATE products
  SET 
    stock_geneva = v_total_geneva,
    stock_portugal = v_total_portugal,
    updated_at = NOW()
  WHERE id = v_prod_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_product_stock_changes ON product_stock;

CREATE TRIGGER trg_sync_product_stock_changes
AFTER INSERT OR UPDATE OR DELETE ON product_stock
FOR EACH ROW EXECUTE FUNCTION sync_product_stock_changes();


-- 2. Atomic Stored Procedure / RPC for Admin Product Updates
CREATE OR REPLACE FUNCTION save_admin_product_full(payload JSONB)
RETURNS JSONB AS $$
DECLARE
  v_raw_id TEXT := payload->>'id';
  v_prod_id UUID;
  v_woo_id TEXT := payload->>'woo_id';
  v_sku TEXT := payload->>'sku';
  v_name TEXT := payload->>'name';
  v_slug TEXT := payload->>'slug';
  v_brand TEXT := COALESCE(payload->>'brand', 'NutriFitness');
  v_base_price NUMERIC := COALESCE((payload->>'base_price')::NUMERIC, 0);
  v_compare_price NUMERIC := (payload->>'compare_at_price')::NUMERIC;
  v_main_location TEXT := COALESCE(payload->>'main_location', 'GENEVA');
  v_status TEXT := COALESCE(payload->>'status', 'published');
  v_images JSONB := COALESCE(payload->'images', '[]'::JSONB);
  v_gtin13 TEXT := payload->>'gtin13';
  v_short_desc TEXT := payload->>'short_description';
  v_desc TEXT := payload->>'description';
  v_ingredients TEXT := payload->>'ingredients';
  v_allergens TEXT := payload->>'allergens';
  v_usage TEXT := payload->>'usage_instructions';
  v_nutrition JSONB := payload->'nutrition';
  v_stock_gen INT := COALESCE((payload->>'stock_geneva')::INT, 0);
  v_stock_pt INT := COALESCE((payload->>'stock_portugal')::INT, 0);
  v_variants JSONB := payload->'variants';
  v_user TEXT := COALESCE(payload->>'user', 'admin');
  v_elem JSONB;
  v_var_id UUID;
  v_var_raw_id TEXT;
  v_var_sku TEXT;
  v_var_flavor TEXT;
  v_var_price NUMERIC;
  v_var_compare NUMERIC;
  v_var_img TEXT;
  v_var_gen INT;
  v_var_pt INT;
  v_var_gtin TEXT;
  v_kept_var_ids UUID[] := ARRAY[]::UUID[];
  v_existing_id UUID;
  v_old_values JSONB := NULL;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  IF v_name IS NULL OR TRIM(v_name) = '' THEN
    RAISE EXCEPTION 'Product name is required';
  END IF;

  -- Resolve Product UUID
  IF v_raw_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
    v_prod_id := v_raw_id::UUID;
    SELECT id INTO v_existing_id FROM products WHERE id = v_prod_id;
  END IF;

  IF v_existing_id IS NULL AND v_slug IS NOT NULL AND TRIM(v_slug) <> '' THEN
    SELECT id INTO v_existing_id FROM products WHERE slug = v_slug LIMIT 1;
    IF v_existing_id IS NOT NULL THEN
      v_prod_id := v_existing_id;
    END IF;
  END IF;

  IF v_existing_id IS NULL AND v_raw_id IS NOT NULL THEN
    DECLARE
      v_clean TEXT := REGEXP_REPLACE(v_raw_id, '^prod-', '');
    BEGIN
      SELECT id INTO v_existing_id FROM products 
      WHERE woo_id = v_raw_id OR woo_id = v_clean OR sku = v_raw_id OR sku = v_clean
      LIMIT 1;
      IF v_existing_id IS NOT NULL THEN
        v_prod_id := v_existing_id;
      END IF;
    END;
  END IF;

  -- Generate deterministic UUID if creating a new product without valid UUID
  IF v_prod_id IS NULL THEN
    v_prod_id := gen_random_uuid();
  END IF;

  IF v_slug IS NULL OR TRIM(v_slug) = '' THEN
    v_slug := LOWER(REGEXP_REPLACE(REGEXP_REPLACE(v_name, '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g'));
  END IF;

  IF v_sku IS NULL OR TRIM(v_sku) = '' THEN
    v_sku := COALESCE(v_raw_id, 'NF-' || SUBSTRING(v_prod_id::TEXT, 1, 8));
  END IF;

  -- A. Upsert to `products`
  IF v_existing_id IS NOT NULL THEN
    SELECT to_jsonb(p) INTO v_old_values FROM products p WHERE p.id = v_prod_id;

    UPDATE products
    SET 
      name = v_name,
      normalized_name = LOWER(TRIM(v_name)),
      slug = v_slug,
      brand = v_brand,
      base_price = v_base_price,
      compare_at_price = v_compare_price,
      main_location = v_main_location,
      status = v_status,
      images = v_images,
      gtin13 = v_gtin13,
      short_description = v_short_desc,
      description = v_desc,
      ingredients = v_ingredients,
      allergens = v_allergens,
      usage_instructions = v_usage,
      nutrition = v_nutrition,
      stock_geneva = v_stock_gen,
      stock_portugal = v_stock_pt,
      deleted_at = CASE WHEN v_status = 'published' THEN NULL ELSE deleted_at END,
      updated_at = v_now
    WHERE id = v_prod_id;
  ELSE
    INSERT INTO products (
      id, woo_id, sku, normalized_name, name, slug, type, status, main_location,
      brand, base_price, compare_at_price, short_description, description,
      images, is_featured, created_at, updated_at, gtin13, nutrition,
      ingredients, allergens, usage_instructions, stock_geneva, stock_portugal
    ) VALUES (
      v_prod_id, COALESCE(v_woo_id, REGEXP_REPLACE(COALESCE(v_raw_id, ''), '^prod-', '')),
      v_sku, LOWER(TRIM(v_name)), v_name, v_slug,
      CASE WHEN v_variants IS NOT NULL AND jsonb_array_length(v_variants) > 1 THEN 'variable' ELSE 'simple' END,
      v_status, v_main_location, v_brand, v_base_price, v_compare_price,
      v_short_desc, v_desc, v_images, false, v_now, v_now, v_gtin13,
      v_nutrition, v_ingredients, v_allergens, v_usage, v_stock_gen, v_stock_pt
    );
  END IF;

  -- B. Upsert parent rows in `product_stock`
  INSERT INTO product_stock (id, product_id, variant_id, origin_id, quantity, is_active, updated_at)
  VALUES (gen_random_uuid(), v_prod_id, NULL, 'GENEVA', v_stock_gen, v_stock_gen > 0 OR v_main_location <> 'PORTUGAL', v_now)
  ON CONFLICT (product_id, variant_id, origin_id)
  DO UPDATE SET quantity = EXCLUDED.quantity, is_active = EXCLUDED.is_active, updated_at = v_now;

  INSERT INTO product_stock (id, product_id, variant_id, origin_id, quantity, is_active, updated_at)
  VALUES (gen_random_uuid(), v_prod_id, NULL, 'PORTUGAL', v_stock_pt, v_stock_pt > 0 OR v_main_location <> 'GENEVA', v_now)
  ON CONFLICT (product_id, variant_id, origin_id)
  DO UPDATE SET quantity = EXCLUDED.quantity, is_active = EXCLUDED.is_active, updated_at = v_now;

  -- C. Upsert variants if provided
  IF v_variants IS NOT NULL AND jsonb_array_length(v_variants) > 0 THEN
    FOR v_elem IN SELECT * FROM jsonb_array_elements(v_variants)
    LOOP
      v_var_raw_id := v_elem->>'id';
      v_var_sku := COALESCE(v_elem->>'sku', 'NF-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 6));
      v_var_flavor := COALESCE(v_elem->>'flavor', v_elem->>'attribute_value', 'Standard');
      v_var_price := COALESCE((v_elem->>'price')::NUMERIC, v_base_price);
      v_var_compare := (v_elem->>'compare_at_price')::NUMERIC;
      v_var_img := v_elem->>'image';
      v_var_gen := COALESCE((v_elem->>'stock_geneva')::INT, 0);
      v_var_pt := COALESCE((v_elem->>'stock_portugal')::INT, 0);
      v_var_gtin := v_elem->>'gtin13';

      v_var_id := NULL;
      IF v_var_raw_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
        SELECT id INTO v_var_id FROM product_variants WHERE id = v_var_raw_id::UUID;
      END IF;

      IF v_var_id IS NULL THEN
        SELECT id INTO v_var_id FROM product_variants 
        WHERE product_id = v_prod_id AND (sku = v_var_sku OR attribute_value = v_var_flavor)
        LIMIT 1;
      END IF;

      IF v_var_id IS NOT NULL THEN
        UPDATE product_variants
        SET 
          sku = v_var_sku,
          attribute_name = 'saveur',
          attribute_value = v_var_flavor,
          price = v_var_price,
          compare_at_price = v_var_compare,
          image_url = v_var_img,
          stock_geneva = v_var_gen,
          stock_portugal = v_var_pt,
          gtin13 = v_var_gtin,
          updated_at = v_now
        WHERE id = v_var_id;
      ELSE
        v_var_id := gen_random_uuid();
        INSERT INTO product_variants (
          id, product_id, sku, attribute_name, attribute_value, price,
          compare_at_price, image_url, stock_geneva, stock_portugal,
          created_at, updated_at, gtin13
        ) VALUES (
          v_var_id, v_prod_id, v_var_sku, 'saveur', v_var_flavor, v_var_price,
          v_var_compare, v_var_img, v_var_gen, v_var_pt,
          v_now, v_now, v_var_gtin
        );
      END IF;

      v_kept_var_ids := ARRAY_APPEND(v_kept_var_ids, v_var_id);

      -- Upsert variant stock in `product_stock`
      INSERT INTO product_stock (id, product_id, variant_id, origin_id, quantity, is_active, updated_at)
      VALUES (gen_random_uuid(), v_prod_id, v_var_id, 'GENEVA', v_var_gen, v_var_gen > 0 OR v_main_location <> 'PORTUGAL', v_now)
      ON CONFLICT (product_id, variant_id, origin_id)
      DO UPDATE SET quantity = EXCLUDED.quantity, is_active = EXCLUDED.is_active, updated_at = v_now;

      INSERT INTO product_stock (id, product_id, variant_id, origin_id, quantity, is_active, updated_at)
      VALUES (gen_random_uuid(), v_prod_id, v_var_id, 'PORTUGAL', v_var_pt, v_var_pt > 0 OR v_main_location <> 'GENEVA', v_now)
      ON CONFLICT (product_id, variant_id, origin_id)
      DO UPDATE SET quantity = EXCLUDED.quantity, is_active = EXCLUDED.is_active, updated_at = v_now;
    END LOOP;

    -- Delete any removed variants
    IF array_length(v_kept_var_ids, 1) > 0 THEN
      DELETE FROM product_stock 
      WHERE product_id = v_prod_id AND variant_id IS NOT NULL AND NOT (variant_id = ANY(v_kept_var_ids));

      DELETE FROM product_variants 
      WHERE product_id = v_prod_id AND NOT (id = ANY(v_kept_var_ids));
    END IF;
  END IF;

  -- D. Insert audit log record
  BEGIN
    INSERT INTO product_audit_log (id, product_id, user_id, action, old_values, new_values, created_at)
    VALUES (
      gen_random_uuid(),
      v_prod_id,
      v_user,
      CASE WHEN v_existing_id IS NOT NULL THEN 'admin_update_product' ELSE 'admin_create_product' END,
      v_old_values,
      payload,
      v_now
    );
  EXCEPTION WHEN OTHERS THEN
    -- Audit log failure should not abort the save
  END;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_prod_id,
    'slug', v_slug,
    'status', v_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

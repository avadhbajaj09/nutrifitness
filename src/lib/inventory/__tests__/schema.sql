CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Minimal schema fixture captured from audit metadata. No business data or credentials.
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  woo_id text,
  sku text,
  normalized_name text NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  type text NOT NULL DEFAULT 'simple'::text,
  status text NOT NULL DEFAULT 'published'::text,
  main_location text NOT NULL DEFAULT 'GENEVA'::text,
  brand text DEFAULT 'NutriFitness'::text,
  base_price numeric NOT NULL DEFAULT 0,
  compare_at_price numeric,
  weight_grams integer DEFAULT 0,
  weight_kg numeric DEFAULT 0,
  short_description text,
  description text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_featured boolean NOT NULL DEFAULT false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  gtin13 text,
  nutrition jsonb,
  ingredients text,
  allergens text,
  usage_instructions text,
  stock_geneva integer DEFAULT 0,
  stock_portugal integer DEFAULT 0
);
CREATE TABLE public.product_variants (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  woo_id text,
  sku text,
  attribute_name text NOT NULL DEFAULT 'flavor'::text,
  attribute_value text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  compare_at_price numeric,
  image_url text,
  stock_geneva integer NOT NULL DEFAULT 0,
  stock_portugal integer NOT NULL DEFAULT 0,
  weight_grams integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  gtin13 text
);
CREATE TABLE public.product_stock (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  variant_id uuid,
  origin_id text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  reserved_quantity integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.product_audit_log (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid,
  user_id text DEFAULT 'admin'::text,
  action text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.fulfillment_stock (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id text NOT NULL,
  product_sku text NOT NULL,
  variant_sku text,
  origin_id text,
  quantity integer NOT NULL DEFAULT 0,
  reserved_quantity integer NOT NULL DEFAULT 0,
  hs_code text,
  country_of_manufacture character,
  weight_grams integer,
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE public.fulfillment_origins (
  id text NOT NULL,
  name text NOT NULL,
  contact_email text NOT NULL,
  company text NOT NULL,
  street text NOT NULL,
  city text NOT NULL,
  postal_code text NOT NULL,
  country_code text NOT NULL,
  sendcloud_sender_address_id text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.fulfillment_origins ADD CONSTRAINT fulfillment_origins_id_check CHECK ((id = ANY (ARRAY['GENEVA'::text, 'PORTUGAL'::text])));
ALTER TABLE public.fulfillment_origins ADD CONSTRAINT fulfillment_origins_pkey PRIMARY KEY (id);
ALTER TABLE public.fulfillment_stock ADD CONSTRAINT fulfillment_stock_pkey PRIMARY KEY (id);
ALTER TABLE public.fulfillment_stock ADD CONSTRAINT fulfillment_stock_product_id_variant_sku_origin_id_key UNIQUE (product_id, variant_sku, origin_id);
ALTER TABLE public.product_audit_log ADD CONSTRAINT product_audit_log_pkey PRIMARY KEY (id);
ALTER TABLE public.product_stock ADD CONSTRAINT product_stock_pkey PRIMARY KEY (id);
ALTER TABLE public.product_stock ADD CONSTRAINT product_stock_product_variant_origin_uniq UNIQUE NULLS NOT DISTINCT (product_id, variant_id, origin_id);
ALTER TABLE public.product_variants ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);
ALTER TABLE public.products ADD CONSTRAINT products_main_location_check CHECK ((main_location = ANY (ARRAY['GENEVA'::text, 'PORTUGAL'::text, 'COMMON'::text])));
ALTER TABLE public.products ADD CONSTRAINT products_pkey PRIMARY KEY (id);
ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);
ALTER TABLE public.products ADD CONSTRAINT products_status_check CHECK ((status = ANY (ARRAY['published'::text, 'draft'::text])));
ALTER TABLE public.products ADD CONSTRAINT products_type_check CHECK ((type = ANY (ARRAY['simple'::text, 'variable'::text])));
CREATE INDEX product_audit_log_created_at_idx ON public.product_audit_log USING btree (created_at DESC);
CREATE INDEX product_audit_log_product_id_idx ON public.product_audit_log USING btree (product_id);
CREATE INDEX product_stock_origin_idx ON public.product_stock USING btree (origin_id);
CREATE INDEX product_stock_product_id_idx ON public.product_stock USING btree (product_id);
CREATE UNIQUE INDEX product_stock_uniq_idx ON public.product_stock USING btree (product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid), origin_id);
CREATE INDEX product_variants_product_id_idx ON public.product_variants USING btree (product_id);
CREATE UNIQUE INDEX product_variants_sku_idx ON public.product_variants USING btree (sku) WHERE ((sku IS NOT NULL) AND (sku <> ''::text));
CREATE UNIQUE INDEX product_variants_woo_id_idx ON public.product_variants USING btree (woo_id) WHERE ((woo_id IS NOT NULL) AND (woo_id <> ''::text));
CREATE INDEX products_deleted_at_idx ON public.products USING btree (deleted_at);
CREATE INDEX products_normalized_name_idx ON public.products USING btree (normalized_name);
CREATE UNIQUE INDEX products_sku_idx ON public.products USING btree (sku) WHERE ((sku IS NOT NULL) AND (sku <> ''::text));
CREATE INDEX products_status_idx ON public.products USING btree (status);
CREATE UNIQUE INDEX products_woo_id_idx ON public.products USING btree (woo_id) WHERE ((woo_id IS NOT NULL) AND (woo_id <> ''::text));
ALTER TABLE public.fulfillment_stock ADD CONSTRAINT fulfillment_stock_origin_id_fkey FOREIGN KEY (origin_id) REFERENCES fulfillment_origins(id) ON DELETE CASCADE;
ALTER TABLE public.product_audit_log ADD CONSTRAINT product_audit_log_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE public.product_stock ADD CONSTRAINT product_stock_origin_id_fkey FOREIGN KEY (origin_id) REFERENCES fulfillment_origins(id) ON DELETE CASCADE;
ALTER TABLE public.product_stock ADD CONSTRAINT product_stock_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE public.product_stock ADD CONSTRAINT product_stock_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE;
ALTER TABLE public.product_variants ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
INSERT INTO fulfillment_origins(id,name,contact_email,company,street,country_code,city,postal_code) VALUES ('GENEVA','Fixture','fixture@example.invalid','Fixture','Fixture','CH','Genève','1201'),('PORTUGAL','Fixture','fixture@example.invalid','Fixture','Fixture','PT','Porto','1000');

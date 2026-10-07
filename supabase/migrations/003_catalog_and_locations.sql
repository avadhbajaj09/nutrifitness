-- ============================================================
-- NutriFitness Part 2: Catalog, Product Variants & Location Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------
-- 1. categories
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------
-- 2. tags
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS tags (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------
-- 3. products
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  woo_id            TEXT,
  sku               TEXT,
  normalized_name   TEXT NOT NULL,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  type              TEXT NOT NULL DEFAULT 'simple' CHECK (type IN ('simple', 'variable')),
  status            TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  main_location     TEXT NOT NULL DEFAULT 'GENEVA' CHECK (main_location IN ('GENEVA', 'PORTUGAL')),
  brand             TEXT DEFAULT 'NutriFitness',
  base_price        NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price  NUMERIC(10,2),
  weight_grams      INT DEFAULT 0,
  weight_kg         NUMERIC(10,3) DEFAULT 0,
  short_description TEXT,
  description       TEXT,
  images            JSONB NOT NULL DEFAULT '[]',
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Sparse Unique Indexes for SKU and Woo ID
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_idx ON products (sku) WHERE sku IS NOT NULL AND sku <> '';
CREATE UNIQUE INDEX IF NOT EXISTS products_woo_id_idx ON products (woo_id) WHERE woo_id IS NOT NULL AND woo_id <> '';
CREATE INDEX IF NOT EXISTS products_normalized_name_idx ON products (normalized_name);
CREATE INDEX IF NOT EXISTS products_status_idx ON products (status);
CREATE INDEX IF NOT EXISTS products_deleted_at_idx ON products (deleted_at);

-- -------------------------------------------------------
-- 4. product_categories (join table)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_categories (
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- -------------------------------------------------------
-- 5. product_tags (join table)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_tags (
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  tag_id      UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- -------------------------------------------------------
-- 6. product_variants (flavors / formats)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  woo_id            TEXT,
  sku               TEXT,
  attribute_name    TEXT NOT NULL DEFAULT 'flavor',
  attribute_value   TEXT NOT NULL,
  price             NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price  NUMERIC(10,2),
  image_url         TEXT,
  stock_geneva      INT NOT NULL DEFAULT 0,
  stock_portugal    INT NOT NULL DEFAULT 0,
  weight_grams      INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS product_variants_sku_idx ON product_variants (sku) WHERE sku IS NOT NULL AND sku <> '';
CREATE UNIQUE INDEX IF NOT EXISTS product_variants_woo_id_idx ON product_variants (woo_id) WHERE woo_id IS NOT NULL AND woo_id <> '';
CREATE INDEX IF NOT EXISTS product_variants_product_id_idx ON product_variants (product_id);

-- -------------------------------------------------------
-- 7. product_stock (per product/variant per origin)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_stock (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id        UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  origin_id         TEXT NOT NULL REFERENCES fulfillment_origins(id) ON DELETE CASCADE,
  quantity          INT NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  reserved_quantity INT NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS product_stock_uniq_idx ON product_stock (
  product_id,
  COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid),
  origin_id
);
CREATE INDEX IF NOT EXISTS product_stock_product_id_idx ON product_stock (product_id);
CREATE INDEX IF NOT EXISTS product_stock_origin_idx ON product_stock (origin_id);

-- -------------------------------------------------------
-- 8. product_audit_log
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_audit_log (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id     TEXT DEFAULT 'admin',
  action      TEXT NOT NULL,
  old_values  JSONB,
  new_values  JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS product_audit_log_product_id_idx ON product_audit_log (product_id);
CREATE INDEX IF NOT EXISTS product_audit_log_created_at_idx ON product_audit_log (created_at DESC);

-- -------------------------------------------------------
-- 9. Row Level Security (RLS)
-- -------------------------------------------------------
ALTER TABLE categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags                ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stock       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_audit_log   ENABLE ROW LEVEL SECURITY;

-- Public READ policies
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "public_read_tags" ON tags FOR SELECT USING (true);
CREATE POLICY "public_read_product_categories" ON product_categories FOR SELECT USING (true);
CREATE POLICY "public_read_product_tags" ON product_tags FOR SELECT USING (true);

-- Public can read published products that are not deleted
CREATE POLICY "public_read_published_products" ON products FOR SELECT USING (
  status = 'published' AND deleted_at IS NULL
);

-- Public can read variants of published products
CREATE POLICY "public_read_published_variants" ON product_variants FOR SELECT USING (
  product_id IN (SELECT id FROM products WHERE status = 'published' AND deleted_at IS NULL)
);

-- Public can read active stock of published products
CREATE POLICY "public_read_active_stock" ON product_stock FOR SELECT USING (
  is_active = true AND product_id IN (SELECT id FROM products WHERE status = 'published' AND deleted_at IS NULL)
);

-- Service Role (and admin) full write access bypass
CREATE POLICY "service_all_categories" ON categories FOR ALL USING (true);
CREATE POLICY "service_all_tags" ON tags FOR ALL USING (true);
CREATE POLICY "service_all_products" ON products FOR ALL USING (true);
CREATE POLICY "service_all_product_categories" ON product_categories FOR ALL USING (true);
CREATE POLICY "service_all_product_tags" ON product_tags FOR ALL USING (true);
CREATE POLICY "service_all_product_variants" ON product_variants FOR ALL USING (true);
CREATE POLICY "service_all_product_stock" ON product_stock FOR ALL USING (true);
CREATE POLICY "service_all_product_audit_log" ON product_audit_log FOR ALL USING (true);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS fulfillment_origins (
  id TEXT PRIMARY KEY CHECK (id IN ('GENEVA', 'PORTUGAL')),
  name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  company TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  sendcloud_sender_address_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fulfillment_countries (
  code CHAR(2) PRIMARY KEY,
  name TEXT NOT NULL,
  is_eu BOOLEAN NOT NULL DEFAULT false,
  is_supported BOOLEAN NOT NULL DEFAULT true,
  requires_customs_from_portugal BOOLEAN NOT NULL DEFAULT false,
  requires_customs_from_geneva BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS origin_country_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  origin_id TEXT REFERENCES fulfillment_origins(id) ON DELETE CASCADE,
  country_code CHAR(2) REFERENCES fulfillment_countries(code) ON DELETE CASCADE,
  is_allowed BOOLEAN NOT NULL DEFAULT true,
  preferred_for_common BOOLEAN NOT NULL DEFAULT false,
  estimated_days_min INT NOT NULL DEFAULT 1,
  estimated_days_max INT NOT NULL DEFAULT 5,
  free_shipping_threshold NUMERIC(10,2),
  UNIQUE(origin_id, country_code)
);

CREATE TABLE IF NOT EXISTS fulfillment_stock (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  variant_sku TEXT,
  origin_id TEXT REFERENCES fulfillment_origins(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 0,
  reserved_quantity INT NOT NULL DEFAULT 0,
  hs_code TEXT,
  country_of_manufacture CHAR(2),
  weight_grams INT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, variant_sku, origin_id)
);

CREATE TABLE IF NOT EXISTS fulfillment_shipments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id TEXT NOT NULL,
  origin_id TEXT REFERENCES fulfillment_origins(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','label_created','label_printed','in_transit','delivered','exception','needs_attention','cancelled')),
  carrier TEXT,
  carrier_code TEXT,
  sendcloud_parcel_id TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  requires_customs BOOLEAN NOT NULL DEFAULT false,
  label_url TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  shipping_address JSONB,
  customs_data JSONB,
  notes TEXT,
  needs_attention BOOLEAN NOT NULL DEFAULT false,
  attention_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fulfillment_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shipment_id UUID REFERENCES fulfillment_shipments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fulfillment_origins ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE origin_country_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fulfillment_origins' AND policyname='public_read_origins') THEN
    CREATE POLICY "public_read_origins" ON fulfillment_origins FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fulfillment_countries' AND policyname='public_read_countries') THEN
    CREATE POLICY "public_read_countries" ON fulfillment_countries FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='origin_country_rules' AND policyname='public_read_rules') THEN
    CREATE POLICY "public_read_rules" ON origin_country_rules FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fulfillment_stock' AND policyname='public_read_stock') THEN
    CREATE POLICY "public_read_stock" ON fulfillment_stock FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fulfillment_shipments' AND policyname='service_all_shipments') THEN
    CREATE POLICY "service_all_shipments" ON fulfillment_shipments FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fulfillment_events' AND policyname='service_all_events') THEN
    CREATE POLICY "service_all_events" ON fulfillment_events FOR ALL USING (true);
  END IF;
END $$;

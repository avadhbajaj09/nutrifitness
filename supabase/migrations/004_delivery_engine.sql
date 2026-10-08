-- Migration: 004_delivery_engine.sql
-- Description: Dynamic Delivery Date Engine schema, seed rules, country groups, holidays and settings

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Country Groups table
CREATE TABLE IF NOT EXISTS country_groups (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  countries TEXT[] NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Delivery Rules table
CREATE TABLE IF NOT EXISTS delivery_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  origin TEXT NOT NULL CHECK (origin IN ('GENEVA', 'PORTUGAL')),
  country_code CHAR(2),
  country_group TEXT REFERENCES country_groups(code) ON DELETE SET NULL,
  shipping_method TEXT,
  is_allowed BOOLEAN NOT NULL DEFAULT true,
  handling_days INT NOT NULL DEFAULT 0,
  cutoff_time TEXT NOT NULL DEFAULT '14:00',
  transit_min_days INT NOT NULL DEFAULT 1,
  transit_max_days INT NOT NULL DEFAULT 3,
  requires_customs BOOLEAN NOT NULL DEFAULT false,
  customs_buffer_days INT NOT NULL DEFAULT 0,
  delivers_saturday BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  needs_verification BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT target_check CHECK (country_code IS NOT NULL OR country_group IS NOT NULL)
);

-- Index for speedy rule lookup
CREATE INDEX IF NOT EXISTS idx_delivery_rules_lookup ON delivery_rules(origin, country_code, shipping_method, is_active);

-- 3. Holidays table
CREATE TABLE IF NOT EXISTS holidays (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  calendar TEXT NOT NULL, -- 'GENEVA', 'PORTUGAL', or ISO country code 'CH', 'FR', 'DE', etc.
  date DATE NOT NULL,
  name TEXT NOT NULL,
  UNIQUE(calendar, date)
);

CREATE INDEX IF NOT EXISTS idx_holidays_cal_date ON holidays(calendar, date);

-- 4. Global Delivery Settings table
CREATE TABLE IF NOT EXISTS delivery_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  extra_delay_days INT NOT NULL DEFAULT 0,
  banner_text TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Extend fulfillment_shipments
ALTER TABLE fulfillment_shipments ADD COLUMN IF NOT EXISTS promised_date DATE;
ALTER TABLE fulfillment_shipments ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE fulfillment_shipments ADD COLUMN IF NOT EXISTS fulfilment_location TEXT;

-- RLS
ALTER TABLE country_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='country_groups' AND policyname='public_read_country_groups') THEN
    CREATE POLICY "public_read_country_groups" ON country_groups FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='country_groups' AND policyname='service_all_country_groups') THEN
    CREATE POLICY "service_all_country_groups" ON country_groups FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='delivery_rules' AND policyname='public_read_delivery_rules') THEN
    CREATE POLICY "public_read_delivery_rules" ON delivery_rules FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='delivery_rules' AND policyname='service_all_delivery_rules') THEN
    CREATE POLICY "service_all_delivery_rules" ON delivery_rules FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='holidays' AND policyname='public_read_holidays') THEN
    CREATE POLICY "public_read_holidays" ON holidays FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='holidays' AND policyname='service_all_holidays') THEN
    CREATE POLICY "service_all_holidays" ON holidays FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='delivery_settings' AND policyname='public_read_delivery_settings') THEN
    CREATE POLICY "public_read_delivery_settings" ON delivery_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='delivery_settings' AND policyname='service_all_delivery_settings') THEN
    CREATE POLICY "service_all_delivery_settings" ON delivery_settings FOR ALL USING (true);
  END IF;
END $$;

-- 6. SEED DATA

-- Default Settings
INSERT INTO delivery_settings (id, extra_delay_days, banner_text)
VALUES ('default', 0, '')
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Country Groups
INSERT INTO country_groups (code, name, countries) VALUES
  ('CH_LI', 'Suisse & Liechtenstein', ARRAY['CH', 'LI']),
  ('EU_NEAR', 'Europe Proche (Frontaliers)', ARRAY['FR', 'DE', 'IT', 'AT']),
  ('EU_BENELUX', 'Benelux', ARRAY['BE', 'LU', 'NL']),
  ('EU_IBERIA', 'Péninsule Ibérique', ARRAY['PT', 'ES']),
  ('EU_CENTRAL', 'Europe Centrale & Nordique', ARRAY['AT', 'IE', 'DK']),
  ('EU_EAST', 'Europe de l''Est & Baltique', ARRAY['SE', 'FI', 'PL', 'CZ', 'SK', 'HU', 'SI', 'HR', 'RO', 'BG', 'EE', 'LV', 'LT']),
  ('EU_MED', 'Méditerranée Insulaire', ARRAY['GR', 'CY', 'MT']),
  ('NON_EU_WEST', 'Europe Hors-UE', ARRAY['UK', 'NO', 'IS'])
ON CONFLICT (code) DO UPDATE SET countries = EXCLUDED.countries, name = EXCLUDED.name, updated_at = NOW();

-- Delivery Rules: Origin GENEVA (Handling 0, cutoff 14:00 Zurich)
INSERT INTO delivery_rules (origin, country_code, shipping_method, is_allowed, handling_days, cutoff_time, transit_min_days, transit_max_days, requires_customs, customs_buffer_days, delivers_saturday, needs_verification) VALUES
  ('GENEVA', 'CH', NULL, true, 0, '14:00', 1, 2, false, 0, false, true),
  ('GENEVA', 'LI', NULL, true, 0, '14:00', 2, 3, false, 0, false, true),
  ('GENEVA', 'FR', NULL, true, 0, '14:00', 3, 5, true, 0, false, true),
  ('GENEVA', 'DE', NULL, true, 0, '14:00', 3, 5, true, 0, false, true),
  ('GENEVA', 'IT', NULL, true, 0, '14:00', 3, 5, true, 0, false, true),
  ('GENEVA', 'AT', NULL, true, 0, '14:00', 3, 5, true, 0, false, true),
  ('GENEVA', 'BE', NULL, true, 0, '14:00', 4, 6, true, 0, false, true),
  ('GENEVA', 'LU', NULL, true, 0, '14:00', 4, 6, true, 0, false, true),
  ('GENEVA', 'NL', NULL, true, 0, '14:00', 4, 6, true, 0, false, true)
ON CONFLICT DO NOTHING;

-- Delivery Rules: Origin PORTUGAL (Handling 1, cutoff 12:00 Lisbon)
INSERT INTO delivery_rules (origin, country_code, shipping_method, is_allowed, handling_days, cutoff_time, transit_min_days, transit_max_days, requires_customs, customs_buffer_days, delivers_saturday, needs_verification) VALUES
  ('PORTUGAL', 'PT', NULL, true, 1, '12:00', 1, 2, false, 0, false, true),
  ('PORTUGAL', 'ES', NULL, true, 1, '12:00', 2, 3, false, 0, false, true),
  ('PORTUGAL', 'FR', NULL, true, 1, '12:00', 3, 5, false, 0, false, true),
  ('PORTUGAL', 'BE', NULL, true, 1, '12:00', 3, 5, false, 0, false, true),
  ('PORTUGAL', 'LU', NULL, true, 1, '12:00', 3, 5, false, 0, false, true),
  ('PORTUGAL', 'NL', NULL, true, 1, '12:00', 3, 5, false, 0, false, true),
  ('PORTUGAL', 'DE', NULL, true, 1, '12:00', 3, 5, false, 0, false, true),
  ('PORTUGAL', 'IT', NULL, true, 1, '12:00', 3, 5, false, 0, false, true),
  ('PORTUGAL', 'AT', NULL, true, 1, '12:00', 4, 6, false, 0, false, true),
  ('PORTUGAL', 'IE', NULL, true, 1, '12:00', 4, 6, false, 0, false, true),
  ('PORTUGAL', 'DK', NULL, true, 1, '12:00', 4, 6, false, 0, false, true),
  ('PORTUGAL', 'SE', NULL, true, 1, '12:00', 5, 7, false, 0, false, true),
  ('PORTUGAL', 'FI', NULL, true, 1, '12:00', 5, 7, false, 0, false, true),
  ('PORTUGAL', 'PL', NULL, true, 1, '12:00', 5, 7, false, 0, false, true),
  ('PORTUGAL', 'CZ', NULL, true, 1, '12:00', 5, 7, false, 0, false, true),
  ('PORTUGAL', 'SK', NULL, true, 1, '12:00', 5, 7, false, 0, false, true),
  ('PORTUGAL', 'HU', NULL, true, 1, '12:00', 5, 7, false, 0, false, true),
  ('PORTUGAL', 'SI', NULL, true, 1, '12:00', 5, 7, false, 0, false, true),
  ('PORTUGAL', 'HR', NULL, true, 1, '12:00', 5, 7, false, 0, false, true),
  ('PORTUGAL', 'RO', NULL, true, 1, '12:00', 5, 7, false, 0, false, true),
  ('PORTUGAL', 'BG', NULL, true, 1, '12:00', 5, 7, false, 0, false, true),
  ('PORTUGAL', 'EE', NULL, true, 1, '12:00', 5, 7, false, 0, false, true),
  ('PORTUGAL', 'LV', NULL, true, 1, '12:00', 5, 7, false, 0, false, true),
  ('PORTUGAL', 'LT', NULL, true, 1, '12:00', 5, 7, false, 0, false, true),
  ('PORTUGAL', 'GR', NULL, true, 1, '12:00', 6, 9, false, 0, false, true),
  ('PORTUGAL', 'CY', NULL, true, 1, '12:00', 6, 9, false, 0, false, true),
  ('PORTUGAL', 'MT', NULL, true, 1, '12:00', 6, 9, false, 0, false, true),
  ('PORTUGAL', 'CH', NULL, true, 1, '12:00', 4, 7, true, 0, false, true),
  ('PORTUGAL', 'LI', NULL, true, 1, '12:00', 5, 8, true, 0, false, true),
  ('PORTUGAL', 'UK', NULL, true, 1, '12:00', 4, 7, true, 0, false, true),
  ('PORTUGAL', 'NO', NULL, true, 1, '12:00', 5, 8, true, 0, false, true),
  ('PORTUGAL', 'IS', NULL, true, 1, '12:00', 6, 10, true, 0, false, true)
ON CONFLICT DO NOTHING;

-- Holidays for Geneva (Swiss national + Geneva cantonal holidays for 2026 and 2027)
INSERT INTO holidays (calendar, date, name) VALUES
  -- 2026 Geneva & Switzerland
  ('GENEVA', '2026-01-01', 'Nouvel An'),
  ('GENEVA', '2026-04-03', 'Vendredi Saint'),
  ('GENEVA', '2026-04-06', 'Lundi de Pâques'),
  ('GENEVA', '2026-05-14', 'Ascension'),
  ('GENEVA', '2026-05-25', 'Lundi de Pentecôte'),
  ('GENEVA', '2026-08-01', 'Fête Nationale Suisse'),
  ('GENEVA', '2026-09-10', 'Jeûne Genevois'),
  ('GENEVA', '2026-12-25', 'Noël'),
  ('GENEVA', '2026-12-31', 'Restauration de la République de Genève'),
  -- 2027 Geneva & Switzerland
  ('GENEVA', '2027-01-01', 'Nouvel An'),
  ('GENEVA', '2027-03-26', 'Vendredi Saint'),
  ('GENEVA', '2027-03-29', 'Lundi de Pâques'),
  ('GENEVA', '2027-05-06', 'Ascension'),
  ('GENEVA', '2027-05-17', 'Lundi de Pentecôte'),
  ('GENEVA', '2027-08-01', 'Fête Nationale Suisse'),
  ('GENEVA', '2027-09-09', 'Jeûne Genevois'),
  ('GENEVA', '2027-12-25', 'Noël'),
  ('GENEVA', '2027-12-31', 'Restauration de la République de Genève'),

  -- 2026 Portugal National Holidays
  ('PORTUGAL', '2026-01-01', 'Ano Novo'),
  ('PORTUGAL', '2026-04-03', 'Sexta-feira Santa'),
  ('PORTUGAL', '2026-04-05', 'Páscoa'),
  ('PORTUGAL', '2026-04-25', 'Dia da Liberdade'),
  ('PORTUGAL', '2026-05-01', 'Dia do Trabalhador'),
  ('PORTUGAL', '2026-06-04', 'Corpo de Deus'),
  ('PORTUGAL', '2026-06-10', 'Dia de Portugal'),
  ('PORTUGAL', '2026-08-15', 'Assunção de Nossa Senhora'),
  ('PORTUGAL', '2026-10-05', 'Implantação da República'),
  ('PORTUGAL', '2026-11-01', 'Dia de Todos os Santos'),
  ('PORTUGAL', '2026-12-01', 'Restauração da Independência'),
  ('PORTUGAL', '2026-12-08', 'Imaculada Conceição'),
  ('PORTUGAL', '2026-12-25', 'Natal'),
  -- 2027 Portugal National Holidays
  ('PORTUGAL', '2027-01-01', 'Ano Novo'),
  ('PORTUGAL', '2027-03-26', 'Sexta-feira Santa'),
  ('PORTUGAL', '2027-03-28', 'Páscoa'),
  ('PORTUGAL', '2027-04-25', 'Dia da Liberdade'),
  ('PORTUGAL', '2027-05-01', 'Dia do Trabalhador'),
  ('PORTUGAL', '2027-05-27', 'Corpo de Deus'),
  ('PORTUGAL', '2027-06-10', 'Dia de Portugal'),
  ('PORTUGAL', '2027-08-15', 'Assunção de Nossa Senhora'),
  ('PORTUGAL', '2027-10-05', 'Implantação da República'),
  ('PORTUGAL', '2027-11-01', 'Dia de Todos os Santos'),
  ('PORTUGAL', '2027-12-01', 'Restauração da Independência'),
  ('PORTUGAL', '2027-12-08', 'Imaculada Conceição'),
  ('PORTUGAL', '2027-12-25', 'Natal')
ON CONFLICT (calendar, date) DO UPDATE SET name = EXCLUDED.name;

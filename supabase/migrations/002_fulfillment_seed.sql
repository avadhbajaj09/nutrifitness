-- Origins
INSERT INTO fulfillment_origins (id, name, company, street, city, postal_code, country_code, contact_email)
VALUES 
('GENEVA', 'NutriFitness Genève', 'NutriFitness', 'Rue des Pâquis 34', 'Genève', '1201', 'CH', 'marco@nutrifitness.ch'),
('PORTUGAL', 'BigMan Nutrition', 'BigMan Nutrition', 'Zona Industrial', 'Oliveira de Azeméis', '3720-000', 'PT', 'omar@nutrifitness.ch')
ON CONFLICT (id) DO NOTHING;

-- Countries
INSERT INTO fulfillment_countries (code, name, is_eu, is_supported, requires_customs_from_portugal, requires_customs_from_geneva) VALUES
('AT', 'Austria', true, true, false, false),
('BE', 'Belgium', true, true, false, false),
('BG', 'Bulgaria', true, true, false, false),
('HR', 'Croatia', true, true, false, false),
('CY', 'Cyprus', true, true, false, false),
('CZ', 'Czech Republic', true, true, false, false),
('DK', 'Denmark', true, true, false, false),
('EE', 'Estonia', true, true, false, false),
('FI', 'Finland', true, true, false, false),
('FR', 'France', true, true, false, false),
('DE', 'Germany', true, true, false, false),
('GR', 'Greece', true, true, false, false),
('HU', 'Hungary', true, true, false, false),
('IE', 'Ireland', true, true, false, false),
('IT', 'Italy', true, true, false, false),
('LV', 'Latvia', true, true, false, false),
('LT', 'Lithuania', true, true, false, false),
('LU', 'Luxembourg', true, true, false, false),
('MT', 'Malta', true, true, false, false),
('NL', 'Netherlands', true, true, false, false),
('PL', 'Poland', true, true, false, false),
('PT', 'Portugal', true, true, false, false),
('RO', 'Romania', true, true, false, false),
('SK', 'Slovakia', true, true, false, false),
('SI', 'Slovenia', true, true, false, false),
('ES', 'Spain', true, true, false, false),
('SE', 'Sweden', true, true, false, false),
('CH', 'Switzerland', false, true, true, false),
('LI', 'Liechtenstein', false, true, true, false),
('GB', 'United Kingdom', false, true, true, false),
('NO', 'Norway', false, true, true, false),
('IS', 'Iceland', false, true, true, false)
ON CONFLICT (code) DO NOTHING;

-- Origin country rules
-- GENEVA
INSERT INTO origin_country_rules (origin_id, country_code, is_allowed, preferred_for_common, estimated_days_min, estimated_days_max) VALUES
('GENEVA', 'CH', true, true, 1, 3),
('GENEVA', 'LI', true, true, 1, 3),
('GENEVA', 'FR', true, false, 1, 3),
('GENEVA', 'DE', true, false, 1, 3),
('GENEVA', 'IT', true, false, 1, 3),
('GENEVA', 'AT', true, false, 1, 3),
('GENEVA', 'BE', false, false, 1, 3),
('GENEVA', 'LU', false, false, 1, 3),
('GENEVA', 'NL', false, false, 1, 3)
ON CONFLICT (origin_id, country_code) DO NOTHING;

-- PORTUGAL
INSERT INTO origin_country_rules (origin_id, country_code, is_allowed, preferred_for_common, estimated_days_min, estimated_days_max) VALUES
('PORTUGAL', 'AT', true, true, 3, 7),
('PORTUGAL', 'BE', true, true, 3, 7),
('PORTUGAL', 'BG', true, true, 3, 7),
('PORTUGAL', 'HR', true, true, 3, 7),
('PORTUGAL', 'CY', true, true, 3, 7),
('PORTUGAL', 'CZ', true, true, 3, 7),
('PORTUGAL', 'DK', true, true, 3, 7),
('PORTUGAL', 'EE', true, true, 3, 7),
('PORTUGAL', 'FI', true, true, 3, 7),
('PORTUGAL', 'FR', true, true, 3, 7),
('PORTUGAL', 'DE', true, true, 3, 7),
('PORTUGAL', 'GR', true, true, 3, 7),
('PORTUGAL', 'HU', true, true, 3, 7),
('PORTUGAL', 'IE', true, true, 3, 7),
('PORTUGAL', 'IT', true, true, 3, 7),
('PORTUGAL', 'LV', true, true, 3, 7),
('PORTUGAL', 'LT', true, true, 3, 7),
('PORTUGAL', 'LU', true, true, 3, 7),
('PORTUGAL', 'MT', true, true, 3, 7),
('PORTUGAL', 'NL', true, true, 3, 7),
('PORTUGAL', 'PL', true, true, 3, 7),
('PORTUGAL', 'PT', true, true, 3, 7),
('PORTUGAL', 'RO', true, true, 3, 7),
('PORTUGAL', 'SK', true, true, 3, 7),
('PORTUGAL', 'SI', true, true, 3, 7),
('PORTUGAL', 'ES', true, true, 3, 7),
('PORTUGAL', 'SE', true, true, 3, 7),
('PORTUGAL', 'CH', true, false, 4, 8),
('PORTUGAL', 'LI', true, false, 4, 8),
('PORTUGAL', 'GB', true, false, 5, 10),
('PORTUGAL', 'NO', true, false, 5, 10),
('PORTUGAL', 'IS', true, false, 5, 10)
ON CONFLICT (origin_id, country_code) DO NOTHING;

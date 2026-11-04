-- 007_create_hero_banners.sql
-- Hero Slider dynamic banner management

CREATE TABLE IF NOT EXISTS public.hero_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT 'Marvelous Nutrition',
  tag TEXT,
  badge TEXT NOT NULL DEFAULT '100% Stock Suisse',
  wide_image TEXT NOT NULL,
  mobile_image TEXT,
  link TEXT NOT NULL,
  cta_text TEXT NOT NULL DEFAULT 'Commander',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for ordering active banners
CREATE INDEX IF NOT EXISTS idx_hero_banners_active_sort ON public.hero_banners (is_active, sort_order ASC);

-- Enable RLS
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active banners
DROP POLICY IF EXISTS "Public can view active banners" ON public.hero_banners;
CREATE POLICY "Public can view active banners" ON public.hero_banners
  FOR SELECT
  USING (true);

-- Allow service_role full access on hero_banners
DROP POLICY IF EXISTS "Service role full access on hero_banners" ON public.hero_banners;
CREATE POLICY "Service role full access on hero_banners" ON public.hero_banners
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed with current 5 default banners if table is empty
INSERT INTO public.hero_banners (sort_order, product_name, brand, tag, badge, wide_image, mobile_image, link, cta_text, is_active)
SELECT * FROM (VALUES
  (
    1,
    'BULK Isolat de Whey CFM 100% – Chocolate Fudge',
    'Marvelous Nutrition',
    '⚡ 52g Protéines · 12g BCAA Naturels',
    '100% Stock Suisse',
    '/images/banners/wide/nutriftiness-banner3.jpg',
    '/images/banners/mobile/imgi_84_nutrifitness-banner18-819x1024.jpg',
    '/produit/iso-bulk-whey-biologique/',
    'Commander la Whey CFM',
    true
  ),
  (
    2,
    'Créatine Monohydrate 100% Micronisée 300g',
    'Marvelous Nutrition',
    '💪 Force · Puissance Explosive · Récupération',
    '100% Stock Suisse',
    '/images/banners/wide/nutriftiness-banner4.jpg',
    '/images/banners/mobile/imgi_12_nutrifitness-banner17.jpg',
    '/produit/creatine-en-poudre-300g/',
    'Découvrir la Créatine',
    true
  ),
  (
    3,
    'Magnésium Bisglycinate Chélaté 90 Gélules',
    'Marvelous Nutrition',
    '🌙 Sommeil Réparateur · Anti-Stress · Système Nerveux',
    '100% Stock Suisse',
    '/images/banners/wide/nutriftiness-banner1.jpg',
    '/images/banners/mobile/imgi_14_nutrifitness-banner-a1-1.jpg',
    '/produit/magnesium-bisglycinate-90-caps/',
    'Voir le Magnésium',
    true
  ),
  (
    4,
    'Le Guide Ultime des Compléments Alimentaires (PDF)',
    'NutriFitness Suisse',
    '📖 11 Ans d''Expérience · Conseils Honnêtes Sans Marketing',
    'Ebook Téléchargeable Immédiat',
    '/images/banners/wide/nutriftiness-banner2.jpg',
    '/images/banners/mobile/imgi_10_guidebook.jpg',
    '/guide-des-complements-alimentaires/',
    'Découvrir le Guide (PDF)',
    true
  ),
  (
    5,
    'Pronutrition Ashwagandha Forte 60 Gélules',
    'Pronutrition',
    '🌿 Équilibre · Énergie & Résilience · Gestion du Stress',
    '100% Stock Suisse',
    '/images/banners/wide/nutriftiness-banner5.jpg',
    '/images/banners/mobile/imgi_9_nutrifitness-banner-a2-1.jpg',
    '/produit/ashwagandha-60-caps/',
    'Découvrir l''Ashwagandha Forte',
    true
  )
) AS v(sort_order, product_name, brand, tag, badge, wide_image, mobile_image, link, cta_text, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.hero_banners);

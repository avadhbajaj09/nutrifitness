-- 009_black_friday_campaign_settings.sql
-- Black Friday automatic tiered discount campaign settings

CREATE TABLE IF NOT EXISTS public.black_friday_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  enabled BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  tiers JSONB NOT NULL DEFAULT '[{"threshold": 50, "discountPercent": 10}, {"threshold": 110, "discountPercent": 15}, {"threshold": 200, "discountPercent": 25}]'::jsonb,
  banner_text TEXT DEFAULT 'BLACK FRIDAY — JUSQU’À −25%',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.black_friday_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Public read black_friday_settings" ON public.black_friday_settings;
CREATE POLICY "Public read black_friday_settings" ON public.black_friday_settings
  FOR SELECT USING (true);

-- Allow service role full access
DROP POLICY IF EXISTS "Service role full access black_friday_settings" ON public.black_friday_settings;
CREATE POLICY "Service role full access black_friday_settings" ON public.black_friday_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Seed default row if empty
INSERT INTO public.black_friday_settings (id, enabled, start_date, end_date, tiers, banner_text)
VALUES (
  'default',
  true,
  '2026-11-20T00:00:00+01:00',
  '2026-12-02T23:59:59+01:00',
  '[{"threshold": 50, "discountPercent": 10}, {"threshold": 110, "discountPercent": 15}, {"threshold": 200, "discountPercent": 25}]'::jsonb,
  'BLACK FRIDAY — JUSQU’À −25%'
)
ON CONFLICT (id) DO NOTHING;

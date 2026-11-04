import { getAdminSupabase, supabase } from './supabase';

export interface HeroBanner {
  id: string;
  productName: string;
  brand: string;
  tag?: string;
  badge: string;
  wideImage: string;
  mobileImage?: string;
  link: string;
  ctaText: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_HERO_BANNERS: HeroBanner[] = [
  {
    id: 'default-1',
    productName: 'BULK Isolat de Whey CFM 100% – Chocolate Fudge',
    brand: 'Marvelous Nutrition',
    tag: '⚡ 52g Protéines · 12g BCAA Naturels',
    badge: '100% Stock Suisse',
    wideImage: '/images/banners/wide/nutriftiness-banner3.jpg',
    mobileImage: '/images/banners/mobile/imgi_84_nutrifitness-banner18-819x1024.jpg',
    link: '/produit/iso-bulk-whey-biologique/',
    ctaText: 'Commander la Whey CFM',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'default-2',
    productName: 'Créatine Monohydrate 100% Micronisée 300g',
    brand: 'Marvelous Nutrition',
    tag: '💪 Force · Puissance Explosive · Récupération',
    badge: '100% Stock Suisse',
    wideImage: '/images/banners/wide/nutriftiness-banner4.jpg',
    mobileImage: '/images/banners/mobile/imgi_12_nutrifitness-banner17.jpg',
    link: '/produit/creatine-en-poudre-300g/',
    ctaText: 'Découvrir la Créatine',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'default-3',
    productName: 'Magnésium Bisglycinate Chélaté 90 Gélules',
    brand: 'Marvelous Nutrition',
    tag: '🌙 Sommeil Réparateur · Anti-Stress · Système Nerveux',
    badge: '100% Stock Suisse',
    wideImage: '/images/banners/wide/nutriftiness-banner1.jpg',
    mobileImage: '/images/banners/mobile/imgi_14_nutrifitness-banner-a1-1.jpg',
    link: '/produit/magnesium-bisglycinate-90-caps/',
    ctaText: 'Voir le Magnésium',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'default-4',
    productName: 'Le Guide Ultime des Compléments Alimentaires (PDF)',
    brand: 'NutriFitness Suisse',
    tag: '📖 11 Ans d\'Expérience · Conseils Honnêtes Sans Marketing',
    badge: 'Ebook Téléchargeable Immédiat',
    wideImage: '/images/banners/wide/nutriftiness-banner2.jpg',
    mobileImage: '/images/banners/mobile/imgi_10_guidebook.jpg',
    link: '/guide-des-complements-alimentaires/',
    ctaText: 'Découvrir le Guide (PDF)',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'default-5',
    productName: 'Pronutrition Ashwagandha Forte 60 Gélules',
    brand: 'Pronutrition',
    tag: '🌿 Équilibre · Énergie & Résilience · Gestion du Stress',
    badge: '100% Stock Suisse',
    wideImage: '/images/banners/wide/nutriftiness-banner5.jpg',
    mobileImage: '/images/banners/mobile/imgi_9_nutrifitness-banner-a2-1.jpg',
    link: '/produit/ashwagandha-60-caps/',
    ctaText: "Découvrir l'Ashwagandha Forte",
    sortOrder: 5,
    isActive: true
  }
];

function mapRowToBanner(row: any): HeroBanner {
  return {
    id: String(row.id),
    productName: row.product_name || '',
    brand: row.brand || 'Marvelous Nutrition',
    tag: row.tag || '',
    badge: row.badge || '100% Stock Suisse',
    wideImage: row.wide_image || '',
    mobileImage: row.mobile_image || row.wide_image || '',
    link: row.link || '/',
    ctaText: row.cta_text || 'Commander',
    sortOrder: typeof row.sort_order === 'number' ? row.sort_order : 0,
    isActive: row.is_active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getActiveHeroBanners(): Promise<HeroBanner[]> {
  try {
    let client = supabase;
    try {
      if (typeof window === 'undefined') {
        client = getAdminSupabase();
      }
    } catch {
      client = supabase;
    }

    const { data, error } = await client
      .from('hero_banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_HERO_BANNERS;
    }

    return data.map(mapRowToBanner);
  } catch (err) {
    console.warn('[Banners] Fallback to default slides due to error:', err);
    return DEFAULT_HERO_BANNERS;
  }
}

export async function getAllHeroBanners(): Promise<HeroBanner[]> {
  try {
    let client = supabase;
    try {
      if (typeof window === 'undefined') {
        client = getAdminSupabase();
      }
    } catch {
      client = supabase;
    }

    const { data, error } = await client
      .from('hero_banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_HERO_BANNERS;
    }

    return data.map(mapRowToBanner);
  } catch (err) {
    console.warn('[Banners] Fallback to default slides due to error:', err);
    return DEFAULT_HERO_BANNERS;
  }
}

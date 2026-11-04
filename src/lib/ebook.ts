export type EbookLanguage = 'fr' | 'en' | 'de' | 'it';

export interface EbookLanguageOption {
  code: EbookLanguage;
  name: string;
  nativeName: string;
  flag: string;
  editionLabel: string;
  downloadUrl: string;
  buttonText: string;
  sku: string;
}

export const EBOOK_LANGUAGES: Record<EbookLanguage, EbookLanguageOption> = {
  fr: {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    editionLabel: 'Édition Française (PDF 66 Pages)',
    downloadUrl: '/api/downloads/ebook?lang=fr',
    buttonText: 'Télécharger le guide en Français (PDF)',
    sku: 'NF-EBOOK-FR'
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    editionLabel: 'English Edition (66-Page PDF)',
    downloadUrl: '/api/downloads/ebook?lang=en',
    buttonText: 'Download the Guide in English (PDF)',
    sku: 'NF-EBOOK-EN'
  },
  de: {
    code: 'de',
    name: 'Allemand',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    editionLabel: 'Deutsche Ausgabe (PDF 66 Seiten)',
    downloadUrl: '/api/downloads/ebook?lang=de',
    buttonText: 'Den Leitfaden auf Deutsch herunterladen (PDF)',
    sku: 'NF-EBOOK-DE'
  },
  it: {
    code: 'it',
    name: 'Italien',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    editionLabel: 'Edizione Italiana (PDF 66 Pagine)',
    downloadUrl: '/api/downloads/ebook?lang=it',
    buttonText: 'Scarica la Guida in Italiano (PDF)',
    sku: 'NF-EBOOK-IT'
  }
};

export const EBOOK_ITEM = {
  id: 'prod-25430',
  slug: { 
    fr: 'le-guide-ultime-des-complements',
    en: 'le-guide-ultime-des-complements',
    de: 'le-guide-ultime-des-complements',
    it: 'le-guide-ultime-des-complements'
  },
  name: { 
    fr: 'Le Guide Ultime des Compléments Alimentaires (Ebook PDF)',
    en: 'The Ultimate Guide to Dietary Supplements (Ebook PDF)',
    de: 'Der Ultimative Leitfaden für Nahrungsergänzungsmittel (Ebook PDF)',
    it: 'La Guida Definitiva agli Integratori Alimentari (Ebook PDF)'
  },
  brand: 'NutriFitness Ebooks',
  categorySlug: 'guides-ebooks',
  isEbook: true,
  priceChf: 29.90,
  price: 29.90,
  compareAtPriceChf: 49.90,
  taxCategory: 'standard' as const,
  images: [{ src: '/images/store/e-book.webp', alt: { fr: 'Le Guide Ultime des Compléments Alimentaires - Ebook 66 Pages' }, width: 800, height: 1000 }]
};

export function getEbookItemForLanguage(lang: EbookLanguage) {
  const opt = EBOOK_LANGUAGES[lang] || EBOOK_LANGUAGES.fr;
  return {
    ...EBOOK_ITEM,
    selectedLanguage: opt.code,
    languageLabel: opt.editionLabel,
    downloadUrl: opt.downloadUrl,
    sku: opt.sku
  };
}

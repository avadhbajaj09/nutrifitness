/**
 * Central company configuration for NutriFitness.ch
 * Official Swiss Enterprise Registry (IDE / UID) details.
 * Strictly compliant with Swiss Federal Law and TWINT / Stripe Onboarding requirements.
 */
export const COMPANY = {
  legalName: 'SCARPANTONI NUTRIFIT',
  tradingName: 'NutriFitness',
  displayName: 'NutriFitness Suisse (SCARPANTONI NUTRIFIT)',
  legalForm: 'Entreprise individuelle (Raison individuelle)',
  legalFormEn: 'Sole proprietorship',
  owner: 'Marco Scarpantoni',
  ownerFullName: 'Marco Scarpantoni',
  founder: 'Marco Scarpantoni',
  uid: 'CHE-177.751.159',
  tvaNumber: 'CHE-177.751.159 TVA',
  rcNumber: 'CH-660.0.768.015-1',
  rcRegistry: 'Registre du Commerce du Canton de Genève',
  address: {
    street: 'Rue des Pâquis 34',
    postalCode: '1201',
    city: 'Genève',
    canton: 'Genève (GE)',
    country: 'Suisse',
    countryCode: 'CH',
    full: 'Rue des Pâquis 34, 1201 Genève, Suisse',
  },
  contact: {
    phone: '+41 79 250 35 64',
    phoneFormatted: '+41 79 250 35 64',
    email: 'info@nutrifitness.ch',
  },
  currency: 'CHF',
  shippingCountry: 'Suisse (CH) & Liechtenstein (LI)',
} as const;

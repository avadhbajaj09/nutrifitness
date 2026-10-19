/**
 * Central company configuration for NutriFitness.ch
 * Official Swiss Enterprise Registry (IDE / UID) details.
 */
export const COMPANY = {
  legalName: 'NutriFitness Suisse',
  legalForm: 'Entreprise individuelle',
  tradingName: 'NutriFitness',
  displayName: 'NutriFitness Suisse',
  founder: 'Équipe NutriFitness Suisse',
  uid: 'CHE-177.751.159',
  address: {
    street: 'Centre Logistique & Boutique Officielle',
    postalCode: '1200',
    city: 'Genève',
    country: 'Suisse',
    full: 'Rue des Pâquis 34, 1201 Genève, Suisse',
  },
  contact: {
    phone: '+41 79 250 35 64',
    phoneFormatted: '+41 79 250 35 64',
    email: 'hello@nutrifitness.ch',
  },
} as const;

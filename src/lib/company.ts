/**
 * Central company configuration for NutriFitness.ch
 * Official Swiss Enterprise Registry (IDE / UID) details.
 */
export const COMPANY = {
  legalName: 'Scarpantoni Nutrifit',
  legalForm: 'Entreprise individuelle',
  tradingName: 'NutriFitness',
  displayName: 'Scarpantoni Nutrifit (NutriFitness)',
  founder: 'Équipe NutriFitness Suisse',
  uid: 'CHE-177.751.159',
  address: {
    street: 'Rue des Pâquis 34',
    postalCode: '1201',
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

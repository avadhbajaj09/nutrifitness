export interface BrandInfo {
  name: string;
  displayName: string;
  slug: string;
  count: number;
  logo: string;
  featured?: boolean;
}

export const ALL_BRANDS: BrandInfo[] = [
  { name: 'Marvelous', displayName: 'Marvelous Nutrition', slug: 'marvelous', count: 25, logo: '/images/brands/logo-marvelous-nutrition.png', featured: true },
  { name: 'Pronutrition.it', displayName: 'Pronutrition', slug: 'pronutrition', count: 24, logo: '/images/brands/logo-pronutrition.png', featured: true },
  { name: 'Bigman', displayName: 'BigMan Nutrition', slug: 'bigman', count: 14, logo: '/images/brands/logo-bigman-nutrition.png', featured: true },
  { name: 'Dirty Squads', displayName: 'Dirty Squads', slug: 'dirty-squads', count: 6, logo: '/images/brands/logo-dirty-squads.png', featured: true },
  { name: 'Applied Nutrition', displayName: 'Applied Nutrition', slug: 'applied-nutrition', count: 3, logo: '/images/brands/logo-applied-nutrition.png', featured: true },
  { name: 'NutriFitness', displayName: 'NutriFitness Lab', slug: 'nutrifitness', count: 3, logo: '/images/brands/logo-nutrifitness-lab.png', featured: true },
  { name: 'Bodyattack', displayName: 'Body Attack', slug: 'bodyattack', count: 2, logo: '/images/brands/logo-body-attack.png', featured: true },
  { name: 'Optimum Nutrition', displayName: 'Optimum Nutrition (ON)', slug: 'optimum-nutrition', count: 1, logo: '/images/brands/logo-optimum-nutrition.png', featured: true },
  { name: 'Dymatize', displayName: 'Dymatize', slug: 'dymatize', count: 1, logo: '/images/brands/logo-dymatize.png', featured: true },
  { name: 'Ghost', displayName: 'Ghost Lifestyle', slug: 'ghost', count: 1, logo: '/images/brands/logo-ghost-lifestyle.png', featured: true },
  { name: 'Per4m', displayName: 'Per4m', slug: 'per4m', count: 1, logo: '/images/brands/logo-per4m.png', featured: true },
  { name: 'Moose Muscle', displayName: 'Moose Muscle', slug: 'moose-muscle', count: 1, logo: '/images/brands/logo-moose-muscle.png' },
  { name: 'Bio Pour Tous', displayName: 'Bio Pour Tous', slug: 'bio-pour-tous', count: 1, logo: '/images/brands/logo-bio-pour-tous.png' },
  { name: 'Powerfood', displayName: 'Powerfood One', slug: 'powerfood', count: 1, logo: '/images/brands/logo-powerfood-one.png' },
  { name: 'Shilajit', displayName: 'Shilajit Pur Himalaya', slug: 'shilajit', count: 1, logo: '/images/brands/logo-shilajit-pur.png' },
  { name: 'Beebad', displayName: 'Beebad Energy', slug: 'beebad', count: 1, logo: '/images/brands/logo-beebad.png' },
  { name: 'More', displayName: 'More Nutrition', slug: 'more', count: 1, logo: '/images/brands/logo-more-nutrition.png' },
  { name: 'Bigs Supplements', displayName: 'Bigs Supplements', slug: 'bigs', count: 1, logo: '/images/brands/logo-bigs-supplements.png' },
  { name: 'Bioyos', displayName: 'Bioyos', slug: 'bioyos', count: 1, logo: '/images/brands/logo-bioyos.png' },
  { name: 'Eurovo', displayName: 'Eurovo Pro', slug: 'eurovo', count: 1, logo: '/images/brands/logo-eurovo.png' },
];

export interface BrandInfo {
  name: string;
  displayName: string;
  slug: string;
  count: number;
  featured?: boolean;
}

export const ALL_BRANDS: BrandInfo[] = [
  { name: 'Marvelous', displayName: 'Marvelous Nutrition', slug: 'marvelous', count: 25, featured: true },
  { name: 'Pronutrition.it', displayName: 'Pronutrition', slug: 'pronutrition', count: 24, featured: true },
  { name: 'Bigman', displayName: 'BigMan Nutrition', slug: 'bigman', count: 14, featured: true },
  { name: 'Dirty Squads', displayName: 'Dirty Squads', slug: 'dirty-squads', count: 6, featured: true },
  { name: 'Applied Nutrition', displayName: 'Applied Nutrition', slug: 'applied-nutrition', count: 3, featured: true },
  { name: 'NutriFitness', displayName: 'NutriFitness Lab', slug: 'nutrifitness', count: 3, featured: true },
  { name: 'Bodyattack', displayName: 'Body Attack', slug: 'bodyattack', count: 2, featured: true },
  { name: 'Optimum Nutrition', displayName: 'Optimum Nutrition (ON)', slug: 'optimum-nutrition', count: 1, featured: true },
  { name: 'Dymatize', displayName: 'Dymatize', slug: 'dymatize', count: 1, featured: true },
  { name: 'Ghost', displayName: 'Ghost Lifestyle', slug: 'ghost', count: 1, featured: true },
  { name: 'Per4m', displayName: 'Per4m', slug: 'per4m', count: 1, featured: true },
  { name: 'Moose Muscle', displayName: 'Moose Muscle', slug: 'moose-muscle', count: 1 },
  { name: 'Bio Pour Tous', displayName: 'Bio Pour Tous', slug: 'bio-pour-tous', count: 1 },
  { name: 'Powerfood', displayName: 'Powerfood One', slug: 'powerfood', count: 1 },
  { name: 'Shilajit', displayName: 'Shilajit Pur Himalaya', slug: 'shilajit', count: 1 },
  { name: 'Beebad', displayName: 'Beebad Energy', slug: 'beebad', count: 1 },
  { name: 'More', displayName: 'More Nutrition', slug: 'more', count: 1 },
  { name: 'Bigs Supplements', displayName: 'Bigs Supplements', slug: 'bigs', count: 1 },
  { name: 'Bioyos', displayName: 'Bioyos', slug: 'bioyos', count: 1 },
  { name: 'Eurovo', displayName: 'Eurovo Pro', slug: 'eurovo', count: 1 },
];

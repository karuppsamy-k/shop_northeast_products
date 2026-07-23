export interface CategoryDefinition {
  id: string;
  name: string;
  emoji: string;
  bgClass: string;
  subCategories: string[];
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'fresh-vegetables',
    name: 'Fresh Vegetables',
    emoji: '🥦',
    bgClass: 'bg-green-100',
    subCategories: ['Leafy Greens', 'Root Vegetables', 'Beans & Gourds', 'Herbs & Flowers', 'Mushrooms', 'Others'],
  },
  {
    id: 'fermented-items',
    name: 'Fermented Items',
    emoji: '🫙',
    bgClass: 'bg-amber-100',
    subCategories: ['Fermented Fish', 'Fermented Soybean', 'Fermented Bamboo', 'Fermented Vegetables', 'Others'],
  },
  {
    id: 'pickle-collection',
    name: 'Pickles & Chutneys',
    emoji: '🌶️',
    bgClass: 'bg-red-100',
    subCategories: ['Meat Pickles', 'Fish Pickles', 'Vegetable Pickles', 'Chili Pickles', 'Sauces & Dips', 'Others'],
  },
  {
    id: 'canned-fish-dry-fish',
    name: 'Canned & Dry Fish',
    emoji: '🐟',
    bgClass: 'bg-blue-100',
    subCategories: ['Canned Fish', 'Dry Fish', 'Dry Prawns', 'Others'],
  },
  {
    id: 'meat-collection',
    name: 'Meat Collection',
    emoji: '🥩',
    bgClass: 'bg-red-200',
    subCategories: ['Fresh Meat', 'Smoked Meat', 'Dried Meat', 'Canned Meat', 'Snails & Others'],
  },
  {
    id: 'noodle-items',
    name: 'Noodle Items',
    emoji: '🍜',
    bgClass: 'bg-yellow-100',
    subCategories: ['Instant Noodles', 'Ramen', 'Thukpa Noodles', 'Sauces', 'Others'],
  },
  {
    id: 'edible',
    name: 'Snacks & Edibles',
    emoji: '🍿',
    bgClass: 'bg-orange-100',
    subCategories: ['Seeds & Nuts', 'Crispy Snacks', 'Traditional Snacks', 'Baked Items', 'Pet Food', 'Others'],
  },
  {
    id: 'biscuit-items',
    name: 'Biscuits & Cakes',
    emoji: '🍪',
    bgClass: 'bg-pink-100',
    subCategories: ['Biscuits', 'Dry Cake', 'Rice Cake', 'Cookies', 'Others'],
  },
  {
    id: 'rice-items',
    name: 'Rice Items',
    emoji: '🌾',
    bgClass: 'bg-green-200',
    subCategories: ['Sticky Rice', 'Aromatic Rice', 'Rice Flour', 'Others'],
  },
  {
    id: 'spices',
    name: 'Spices & Masala',
    emoji: '🧂',
    bgClass: 'bg-orange-200',
    subCategories: ['Masala Mixes', 'Chili Flakes', 'Turmeric', 'Seasonings', 'Others'],
  },
  {
    id: 'tea-coffee',
    name: 'Tea & Coffee',
    emoji: '☕',
    bgClass: 'bg-teal-100',
    subCategories: ['Tea', 'Coffee', 'Instant Mix', 'Others'],
  },
  {
    id: 'cold-drinks',
    name: 'Cold Drinks',
    emoji: '🥤',
    bgClass: 'bg-blue-200',
    subCategories: ['Energy Drinks', 'Juices', 'Soft Drinks', 'Others'],
  },
  {
    id: 'preserved-fruits-dry',
    name: 'Preserved Fruits',
    emoji: '🍑',
    bgClass: 'bg-rose-100',
    subCategories: ['Dry Fruits', 'Tamarind', 'Prunes', 'Others'],
  },
  {
    id: 'cookware-handicrafts',
    name: 'Cookware & Handicrafts',
    emoji: '🏺',
    bgClass: 'bg-indigo-100',
    subCategories: ['Mortar & Pestle', 'Knives', 'Cookers', 'Wooden Items', 'Bamboo Items', 'Others'],
  },
  {
    id: 'mix-collection',
    name: 'Mix Collection',
    emoji: '🛍️',
    bgClass: 'bg-slate-100',
    subCategories: ['Betel & Tobacco', 'Yeast & Fermentation', 'Household', 'Others'],
  },
];

export const getCategoryById = (id: string): CategoryDefinition | undefined => {
  return CATEGORIES.find(c => c.id === id);
};

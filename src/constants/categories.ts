export interface CategoryDefinition {
  id: string;
  name: string;
  emoji: string;
  bgClass: string;
}

export const CATEGORIES: CategoryDefinition[] = [
  { id: 'fresh-and-meat', name: 'Fresh & Meat', emoji: '🥩', bgClass: 'bg-red-100' },
  { id: 'rice-and-dry-foods', name: 'Rice & Dry Foods', emoji: '🌾', bgClass: 'bg-green-100' },
  { id: 'noodles-and-instant-foods', name: 'Noodles & Instant Foods', emoji: '🍜', bgClass: 'bg-yellow-200' },
  { id: 'snacks-and-biscuits', name: 'Snacks & Biscuits', emoji: '🍪', bgClass: 'bg-orange-100' },
  { id: 'sweets-and-chocolates', name: 'Sweets & Chocolates', emoji: '🍫', bgClass: 'bg-pink-100' },
  { id: 'sauces-pickles-masala', name: 'Sauces, Pickles & Masala', emoji: '🌶️', bgClass: 'bg-red-200' },
  { id: 'drinks-and-beverages', name: 'Drinks & Beverages', emoji: '🥤', bgClass: 'bg-blue-100' },
  { id: 'pan-and-tobacco', name: 'Pan & Tobacco', emoji: '🚬', bgClass: 'bg-stone-300' },
  { id: 'personal-care', name: 'Personal Care', emoji: '🧼', bgClass: 'bg-cyan-100' },
  { id: 'specialty-and-others', name: 'Specialty & Others', emoji: '📦', bgClass: 'bg-slate-200' },
];

export const getCategoryById = (id: string): CategoryDefinition | undefined => {
  return CATEGORIES.find(c => c.id === id);
};

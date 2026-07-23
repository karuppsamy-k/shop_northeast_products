export interface CategoryDefinition {
  id: string;
  name: string;
  emoji: string;
  bgClass: string;
  subCategories: string[];
}

export const CATEGORIES: CategoryDefinition[] = [
  { id: 'fresh-vegetables', name: 'Fresh vegetables', emoji: '🥦', bgClass: 'bg-green-100', subCategories: [] },
  { id: 'soft-drinks', name: 'Soft drinks', emoji: '🥤', bgClass: 'bg-blue-100', subCategories: [] },
  { id: 'energy-drinks', name: 'Energy drinks', emoji: '⚡', bgClass: 'bg-yellow-100', subCategories: [] },
  { id: 'pickles', name: 'Pickles', emoji: '🌶️', bgClass: 'bg-red-100', subCategories: [] },
  { id: 'candys', name: "Candy's", emoji: '🍬', bgClass: 'bg-pink-100', subCategories: [] },
  { id: 'cakes', name: 'Cakes', emoji: '🍰', bgClass: 'bg-rose-100', subCategories: [] },
  { id: 'rusk', name: 'Rusk', emoji: '🍞', bgClass: 'bg-orange-100', subCategories: [] },
  { id: 'crispy-crackers', name: 'Crispy crackers', emoji: '🍘', bgClass: 'bg-amber-100', subCategories: [] },
  { id: 'teen-fish', name: 'Teen fish', emoji: '🥫', bgClass: 'bg-blue-200', subCategories: [] },
  { id: 'cup-noodles', name: 'Cup noodles', emoji: '🍜', bgClass: 'bg-yellow-200', subCategories: [] },
  { id: 'noodles', name: 'Noodles', emoji: '🍝', bgClass: 'bg-orange-200', subCategories: [] },
  { id: 'fermented-items', name: "Fermented item's", emoji: '🫙', bgClass: 'bg-amber-200', subCategories: [] },
  { id: 'dry-items', name: "Dry item's", emoji: '🥜', bgClass: 'bg-stone-200', subCategories: [] },
  { id: 'cookies', name: 'Cookies', emoji: '🍪', bgClass: 'bg-yellow-100', subCategories: [] },
  { id: 'sauces', name: 'Sauces', emoji: '🥫', bgClass: 'bg-red-200', subCategories: [] },
  { id: 'peanuts', name: 'Peanuts', emoji: '🥜', bgClass: 'bg-orange-100', subCategories: [] },
  { id: 'bhujiya', name: 'Bhujiya', emoji: '🥨', bgClass: 'bg-yellow-200', subCategories: [] },
  { id: 'bmc-masala', name: 'BMC masala', emoji: '🧂', bgClass: 'bg-red-100', subCategories: [] },
  { id: 'sweet-and-sour', name: 'Sweet and sour', emoji: '🍋', bgClass: 'bg-green-200', subCategories: [] },
  { id: 'tobacco', name: 'Tobacco', emoji: '🚬', bgClass: 'bg-stone-300', subCategories: [] },
  { id: 'soap', name: 'Soap', emoji: '🧼', bgClass: 'bg-cyan-100', subCategories: [] },
  { id: 'seeds', name: 'Seeds', emoji: '🌻', bgClass: 'bg-emerald-100', subCategories: [] },
  { id: 'chocolates', name: "Chocolate's", emoji: '🍫', bgClass: 'bg-amber-300', subCategories: [] },
  { id: 'rice', name: 'Rice', emoji: '🌾', bgClass: 'bg-green-100', subCategories: [] },
  { id: 'mg5', name: 'MG5', emoji: '📦', bgClass: 'bg-slate-200', subCategories: [] },
  { id: 'biscuits', name: 'Biscuits', emoji: '🍪', bgClass: 'bg-orange-100', subCategories: [] },
  { id: 'shrimp-paste', name: 'Shrimp paste', emoji: '🦐', bgClass: 'bg-rose-200', subCategories: [] },
  { id: 'powder', name: 'Powder', emoji: '🥄', bgClass: 'bg-gray-100', subCategories: [] },
  { id: 'jellys', name: "Jelly's", emoji: '🍮', bgClass: 'bg-purple-100', subCategories: [] },
  { id: 'beetle-nuts', name: 'Beetle nuts', emoji: '🥥', bgClass: 'bg-emerald-200', subCategories: [] },
  { id: 'meat', name: 'Meat', emoji: '🥩', bgClass: 'bg-red-300', subCategories: [] },
  { id: 'new-lauches', name: 'new Lauches', emoji: '🚀', bgClass: 'bg-indigo-100', subCategories: [] },
];

export const getCategoryById = (id: string): CategoryDefinition | undefined => {
  return CATEGORIES.find(c => c.id === id);
};

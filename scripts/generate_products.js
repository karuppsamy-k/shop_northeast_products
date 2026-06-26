import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const now = new Date().toISOString();

// ONLY the exact items from the inventory list
const inventory = [

  // ── cat_001 Fresh Vegetables ──────────────────────────────────────────
  { cat: 'cat_001', name: 'Local Tomato',          price: 80,  unit: '/kg',     img: '/assets/Veg.png', organic: true,  featured: true  },
  { cat: 'cat_001', name: 'Cherry Tomato',          price: 120, unit: '/kg',     img: '/assets/Veg.png', organic: true,  featured: true  },
  { cat: 'cat_001', name: 'Green Round Eggplant',   price: 60,  unit: '/kg',     img: '/assets/Veg.png', organic: true,  featured: false },
  { cat: 'cat_001', name: 'Local Black Brinjal',    price: 100, unit: '/kg',     img: '/assets/Veg.png', organic: true,  featured: false },
  { cat: 'cat_001', name: 'Winged Beans',           price: 100, unit: '1 Bundle',img: '/assets/Veg.png', organic: true,  featured: false },
  { cat: 'cat_001', name: 'Sword Beans',            price: 100, unit: '1 Bundle',img: '/assets/Veg.png', organic: true,  featured: false },
  { cat: 'cat_001', name: 'Green Beans',            price: 50,  unit: '1 Bundle',img: '/assets/Veg.png', organic: true,  featured: false },
  { cat: 'cat_001', name: 'Small Sticky Beans',     price: 80,  unit: '/bunch',  img: '/assets/Veg.png', organic: true,  featured: false },
  { cat: 'cat_001', name: 'Pumpkin',                price: 100, unit: '1 pc',    img: '/assets/Veg.png', organic: true,  featured: false },
  { cat: 'cat_001', name: 'Pumpkin Flower',         price: 15,  unit: '/bunch',  img: '/assets/Veg.png', organic: true,  featured: true  },
  { cat: 'cat_001', name: 'Long Yam',               price: 100, unit: '/kg',     img: '/assets/Veg.png', organic: true,  featured: false },
  { cat: 'cat_001', name: 'Lotus Stem',             price: 50,  unit: '1 Bundle',img: '/assets/Veg.png', organic: true,  featured: false },
  { cat: 'cat_001', name: 'Bamboo Shoot (Fresh)',   price: 100, unit: '/kg',     img: '/assets/Veg.png', organic: true,  featured: true  },
  { cat: 'cat_001', name: 'Thai Ginger',            price: 100, unit: '/kg',     img: '/assets/Veg.png', organic: true,  featured: false },
  { cat: 'cat_001', name: 'Ginger Flower',          price: 100, unit: '1 Bundle',img: '/assets/Veg.png', organic: true,  featured: true  },
  { cat: 'cat_001', name: 'Kohl Stem',              price: 100, unit: '1 Bundle',img: '/assets/Veg.png', organic: true,  featured: true  },
  { cat: 'cat_001', name: 'Sticky Corn',            price: 150, unit: '2 pcs',   img: '/assets/Veg.png', organic: true,  featured: false },

  // ── cat_002 Leafy Greens ──────────────────────────────────────────────
  { cat: 'cat_002', name: 'Mustard Leaf',           price: 50,  unit: '1 Bundle',img: '/assets/organic.png', organic: true, featured: true  },
  { cat: 'cat_002', name: 'Flower Mustard Leaf',    price: 50,  unit: '5 Bunch', img: '/assets/organic.png', organic: true, featured: false },
  { cat: 'cat_002', name: 'Pumpkin Leaf',           price: 50,  unit: '1 Bundle',img: '/assets/organic.png', organic: true, featured: false },
  { cat: 'cat_002', name: 'Yam Leaf',               price: 50,  unit: '1 Bundle',img: '/assets/organic.png', organic: true, featured: false },
  { cat: 'cat_002', name: 'Taro Leaf',              price: 50,  unit: '1 Bundle',img: '/assets/organic.png', organic: true, featured: false },
  { cat: 'cat_002', name: 'Bamboo Shoot Leaf',      price: 50,  unit: '1 Bundle',img: '/assets/organic.png', organic: true, featured: false },
  { cat: 'cat_002', name: 'BP Leaf',                price: 50,  unit: '5 Bunch', img: '/assets/organic.png', organic: true, featured: false },
  { cat: 'cat_002', name: 'Fern',                   price: 200, unit: '1 Bundle',img: '/assets/organic.png', organic: true, featured: true  },
  { cat: 'cat_002', name: 'Ningro / Dhekia Saag',  price: 200, unit: '1 Bundle',img: '/assets/organic.png', organic: true, featured: true  },
  { cat: 'cat_002', name: 'Culantro',               price: 30,  unit: '/bunch',  img: '/assets/organic.png', organic: true, featured: false },
  { cat: 'cat_002', name: 'Mithichinga Leaf',       price: 150, unit: '1 Bundle',img: '/assets/organic.png', organic: true, featured: true  },
  { cat: 'cat_002', name: 'Cha-Om Leaf',            price: 50,  unit: '4 Bunch', img: '/assets/organic.png', organic: true, featured: true  },

  // ── cat_003 Chillies & Spices ─────────────────────────────────────────
  { cat: 'cat_003', name: 'King Chilli (Bhut Jolokia)', price: 50,  unit: '4 pcs',  img: '/assets/spices.png', organic: true, featured: true  },
  { cat: 'cat_003', name: 'Bird Eye Chilli',            price: 100, unit: '/kg',     img: '/assets/spices.png', organic: true, featured: true  },
  { cat: 'cat_003', name: 'Pepper',                     price: 50,  unit: '100g',    img: '/assets/spices.png', organic: true, featured: false },
  { cat: 'cat_003', name: 'Timur Pickle',               price: 120, unit: '1 Jar',   img: '/assets/spices.png', organic: true, featured: false },
  { cat: 'cat_003', name: 'Sichuan Pepper',             price: 150, unit: '100g',    img: '/assets/spices.png', organic: true, featured: false },
  { cat: 'cat_003', name: 'Lakadong Turmeric',          price: 200, unit: '250g',    img: '/assets/spices.png', organic: true, featured: true  },
  { cat: 'cat_003', name: 'Dry Ginger',                 price: 100, unit: '100g',    img: '/assets/spices.png', organic: true, featured: false },

  // ── cat_004 Fruits ────────────────────────────────────────────────────
  { cat: 'cat_004', name: 'Lemon',     price: 30,  unit: '1 Dozen', img: '/assets/Fruit.png', organic: true, featured: false },
  { cat: 'cat_004', name: 'Kaji Lemon',price: 60,  unit: '6 pcs',   img: '/assets/Fruit.png', organic: true, featured: true  },
  { cat: 'cat_004', name: 'Plum',      price: 100, unit: '/kg',      img: '/assets/Fruit.png', organic: true, featured: false },

  // ── cat_005 Rice, Grains & Millets ───────────────────────────────────
  { cat: 'cat_005', name: 'Pearl Millet (Bajra)', price: 100, unit: '/kg', img: '/assets/rice.png', organic: true, featured: false },
  { cat: 'cat_005', name: 'Sticky Rice',           price: 120, unit: '/kg', img: '/assets/rice.png', organic: true, featured: true  },
  { cat: 'cat_005', name: 'Black Rice',            price: 180, unit: '/kg', img: '/assets/rice.png', organic: true, featured: true  },
  { cat: 'cat_005', name: 'Red Rice',              price: 150, unit: '/kg', img: '/assets/rice.png', organic: true, featured: false },
  { cat: 'cat_005', name: 'Joha Rice',             price: 200, unit: '/kg', img: '/assets/rice.png', organic: true, featured: true  },

  // ── cat_006 Pickles & Fermented Foods ────────────────────────────────
  { cat: 'cat_006', name: 'Akhuni',                  price: 150, unit: '200g', img: '/assets/pickle.png', organic: true,  featured: true  },
  { cat: 'cat_006', name: 'Axone',                   price: 180, unit: '200g', img: '/assets/pickle.png', organic: true,  featured: true  },
  { cat: 'cat_006', name: 'Bamboo Shoot Pickle',     price: 120, unit: '250g', img: '/assets/pickle.png', organic: true,  featured: true  },
  { cat: 'cat_006', name: 'Dry Fish Pickle',         price: 200, unit: '250g', img: '/assets/pickle.png', organic: false, featured: false },
  { cat: 'cat_006', name: 'Chicken Pickle',          price: 250, unit: '250g', img: '/assets/pickle.png', organic: false, featured: false },
  { cat: 'cat_006', name: 'Pork Pickle',             price: 280, unit: '250g', img: '/assets/pickle.png', organic: false, featured: false },
  { cat: 'cat_006', name: 'Beef Pickle',             price: 280, unit: '250g', img: '/assets/pickle.png', organic: false, featured: false },
  { cat: 'cat_006', name: 'Fish Pickle',             price: 220, unit: '250g', img: '/assets/pickle.png', organic: false, featured: false },
  { cat: 'cat_006', name: 'Naga Chilli Pickle',      price: 150, unit: '200g', img: '/assets/pickle.png', organic: true,  featured: true  },
  { cat: 'cat_006', name: 'Lemon Pickle',            price: 100, unit: '200g', img: '/assets/pickle.png', organic: true,  featured: false },
  { cat: 'cat_006', name: 'Garlic Pickle',           price: 120, unit: '200g', img: '/assets/pickle.png', organic: true,  featured: false },
  { cat: 'cat_006', name: 'Dry Bamboo Slices',       price: 80,  unit: '200g', img: '/assets/pickle.png', organic: true,  featured: false },
  { cat: 'cat_006', name: 'Fermented Bamboo Shoot',  price: 100, unit: '250g', img: '/assets/pickle.png', organic: true,  featured: false },
  { cat: 'cat_006', name: 'Fermented Beans',         price: 120, unit: '200g', img: '/assets/pickle.png', organic: true,  featured: false },
  { cat: 'cat_006', name: 'Dry Fish',                price: 180, unit: '200g', img: '/assets/pickle.png', organic: false, featured: false },
  { cat: 'cat_006', name: 'Ngari (Fermented Fish)',  price: 180, unit: '200g', img: '/assets/pickle.png', organic: false, featured: true  },
  { cat: 'cat_006', name: 'Tuningkob',               price: 150, unit: '200g', img: '/assets/pickle.png', organic: true,  featured: true  },
  { cat: 'cat_006', name: 'Mizo Fermented Products', price: 160, unit: '200g', img: '/assets/pickle.png', organic: true,  featured: false },

  // ── cat_007 Dry Fish & Meat ───────────────────────────────────────────
  { cat: 'cat_007', name: 'Dry Fish',               price: 300, unit: '250g', img: '/assets/dry feiuets.png', organic: false, featured: true  },
  { cat: 'cat_007', name: 'Dry Fish (Varieties)',   price: 350, unit: '250g', img: '/assets/dry feiuets.png', organic: false, featured: false },
  { cat: 'cat_007', name: 'Fish Pickle',            price: 220, unit: '250g', img: '/assets/dry feiuets.png', organic: false, featured: false },
  { cat: 'cat_007', name: 'Dry Meat',               price: 500, unit: '250g', img: '/assets/dry feiuets.png', organic: false, featured: false },
  { cat: 'cat_007', name: 'Smoked Products',        price: 450, unit: '250g', img: '/assets/dry feiuets.png', organic: false, featured: true  },

  // ── cat_008 Snacks & Bakery ───────────────────────────────────────────
  { cat: 'cat_008', name: 'Local Chilli Powder', price: 80,  unit: '100g',    img: '/assets/snaks.png', organic: true,  featured: false },
  { cat: 'cat_008', name: 'Dry Cake',            price: 120, unit: '1 Pack',  img: '/assets/snaks.png', organic: false, featured: false },
  { cat: 'cat_008', name: 'Dog Food',            price: 150, unit: '1 Pack',  img: '/assets/snaks.png', organic: false, featured: false },
  { cat: 'cat_008', name: 'Cat Food',            price: 150, unit: '1 Pack',  img: '/assets/snaks.png', organic: false, featured: false },
  { cat: 'cat_008', name: 'Rabbit Food',         price: 120, unit: '1 Pack',  img: '/assets/snaks.png', organic: false, featured: false },
  { cat: 'cat_008', name: 'Handmade Cake',       price: 200, unit: '1 Piece', img: '/assets/snaks.png', organic: false, featured: true  },
  { cat: 'cat_008', name: 'Cookies',             price: 150, unit: '1 Pack',  img: '/assets/snaks.png', organic: false, featured: false },
  { cat: 'cat_008', name: 'Makhana (Fox Nuts)',  price: 180, unit: '200g',    img: '/assets/snaks.png', organic: true,  featured: false },
  { cat: 'cat_008', name: 'Puffed Rice',         price: 40,  unit: '200g',    img: '/assets/snaks.png', organic: false, featured: false },
  { cat: 'cat_008', name: 'Rice Cake',           price: 60,  unit: '1 Pack',  img: '/assets/snaks.png', organic: false, featured: false },

  // ── cat_009 Herbs & Flowers ───────────────────────────────────────────
  { cat: 'cat_009', name: 'Culantro',                   price: 30, unit: '/bunch',   img: '/assets/organic.png', organic: true, featured: false },
  { cat: 'cat_009', name: 'Ginger Flower',              price: 100, unit: '1 Bundle', img: '/assets/organic.png', organic: true, featured: true  },
  { cat: 'cat_009', name: 'Pumpkin Flower',             price: 15,  unit: '/bunch',   img: '/assets/organic.png', organic: true, featured: false },
  { cat: 'cat_009', name: 'Banana Flower',              price: 60,  unit: '1 pc',     img: '/assets/organic.png', organic: true, featured: false },
  { cat: 'cat_009', name: 'Blue Pea Flower',            price: 80,  unit: '1 Bundle', img: '/assets/organic.png', organic: true, featured: true  },
  { cat: 'cat_009', name: 'Hibiscus Flower',            price: 60,  unit: '1 Bundle', img: '/assets/organic.png', organic: true, featured: false },

  // ── cat_010 Household / Miscellaneous ────────────────────────────────
  { cat: 'cat_010', name: 'Cigarette',            price: 15,  unit: '1 pc',  img: '/assets/household.png', organic: false, featured: false },
  { cat: 'cat_010', name: 'Win Cigarette',        price: 20,  unit: '1 pc',  img: '/assets/household.png', organic: false, featured: false },
  { cat: 'cat_010', name: 'Matchbox',             price: 10,  unit: '1 Pack',img: '/assets/household.png', organic: false, featured: false },
  { cat: 'cat_010', name: 'Household Essentials', price: 200, unit: '1 Kit', img: '/assets/household.png', organic: false, featured: false },
];

const origins = ['Manipur', 'Nagaland', 'Assam', 'Meghalaya', 'Mizoram', 'Arunachal Pradesh', 'Tripura', 'Sikkim'];

function randBetween(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

const products = inventory.map((item, i) => {
  const id = `prod_${String(i + 1).padStart(4, '0')}`;
  const discountPct = randBetween(0, 20);
  const discountPrice = discountPct > 0 ? Math.round(item.price * (1 - discountPct / 100)) : item.price;
  const origin = origins[i % origins.length];

  return {
    id,
    categoryId: item.cat,
    name: item.name,
    description: `Fresh and authentic ${item.name} sourced directly from Northeast India. A unique specialty product that makes our store stand out from Zepto and Blinkit.`,
    shortDescription: `Authentic Northeast ${item.name}`,
    price: item.price,
    discountPrice,
    unit: item.unit,
    weight: 500,
    images: [item.img],
    origin,
    farmerOrSource: 'Local Farmer Network',
    ingredients: [item.name],
    nutritionalInfo: { calories: 80, protein: '3g', carbs: '15g' },
    stock: randBetween(20, 200),
    rating: parseFloat((4 + Math.random()).toFixed(1)),
    reviewCount: randBetween(10, 500),
    isOrganic: item.organic,
    isFeatured: item.featured,
    tags: ['northeast', 'authentic', 'specialty'],
    createdAt: now,
  };
});

const outPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
fs.writeFileSync(outPath, JSON.stringify(products, null, 2));
console.log(`✅ Written ${products.length} products to products.json`);

// Print count per category
const catCounts = {};
products.forEach(p => { catCounts[p.categoryId] = (catCounts[p.categoryId] || 0) + 1; });
console.log('\nProducts per category:');
Object.entries(catCounts).forEach(([cat, count]) => console.log(`  ${cat}: ${count} products`));

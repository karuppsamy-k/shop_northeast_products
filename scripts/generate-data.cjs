const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  { id: 'cat_001', name: 'Northeast Tea', description: 'Authentic Assam, Darjeeling and specialty teas', image: '/assets/tea.png', bannerImage: '/assets/tea.png' },
  { id: 'cat_002', name: 'Spices & Herbs', description: 'Pure Lakadong turmeric, Bhut Jolokia & indigenous spices', image: '/assets/spices.png', bannerImage: '/assets/spices.png' },
  { id: 'cat_003', name: 'Pickles & Condiments', description: 'Spicy King Chilli, Bamboo shoot and meat pickles', image: '/assets/pickle.png', bannerImage: '/assets/pickle.png' },
  { id: 'cat_004', name: 'Rice & Grains', description: 'Organic Joha, Black rice, Red rice and sticky rice', image: '/assets/rice.png', bannerImage: '/assets/rice.png' },
  { id: 'cat_005', name: 'Natural Honey & Forest', description: 'Wild forest honey and natural bee products', image: '/assets/organic.png', bannerImage: '/assets/organic.png' },
  { id: 'cat_006', name: 'Traditional Snacks', description: 'Local rice snacks, Pitha and handmade cookies', image: '/assets/snaks.png', bannerImage: '/assets/snaks.png' },
  { id: 'cat_007', name: 'Dry Meat & Fish', description: 'Authentic smoked meats and dried fish', image: '/assets/food.png', bannerImage: '/assets/food.png' },
  { id: 'cat_008', name: 'Handlooms & Handicrafts', description: 'Traditional shawls, silk and bamboo crafts', image: '/assets/household.png', bannerImage: '/assets/household.png' },
];

const ITEM_TEMPLATES = {
  cat_001: ['Assam CTC Black Tea', 'Darjeeling First Flush', 'Assam Orthodox Tea', 'Green Tea Loose Leaf', 'Oolong Tea', 'White Tea', 'Lemongrass Tea', 'Roselle/Hibiscus Tea', 'Blue Pea Flower Tea', 'Masala Chai Blend'],
  cat_002: ['Lakadong Turmeric Powder', 'Bhut Jolokia (Ghost Pepper) Dry', 'Sichuan Pepper (Timur)', 'Meghalaya Black Pepper', 'Large Cardamom', 'Ginger Powder', 'Naga Chilli Powder', 'Cinnamon Bark', 'Bay Leaf', 'Mustard Seeds'],
  cat_003: ['Bhut Jolokia Pickle', 'Bamboo Shoot Pickle', 'Pork Pickle with King Chilli', 'Beef Pickle', 'Fermented Soybean (Axone)', 'Dry Fish Pickle', 'Mango Mustard Pickle', 'Lemon Pickle', 'Chicken Pickle', 'Garlic King Chilli Pickle'],
  cat_004: ['Joha Rice (Fragrant)', 'Chak-Hao (Black Rice)', 'Red Rice', 'Sticky/Glutinous Rice', 'Bora Saul', 'Aijong Rice', 'Organic Basmati', 'Foxtail Millet', 'Buckwheat', 'Maize/Corn'],
  cat_005: ['Wild Forest Honey', 'Mustard Flower Honey', 'Rock Bee Honey', 'Bee Pollen', 'Organic Beeswax', 'Raw Honey with Ginger', 'Tulsi Honey', 'Himalayan Shilajit', 'Aloe Vera Gel', 'Cold Pressed Mustard Oil'],
  cat_006: ['Til Pitha', 'Narikol Pitha (Coconut)', 'Rice Crackers', 'Handmade Cookies', 'Sesame Ladoo', 'Jaggery Sweets', 'Tapioca Chips', 'Banana Chips', 'Roasted Makhana', 'Sweet Murku'],
  cat_007: ['Smoked Pork', 'Smoked Beef', 'Dry Fish (Ngari)', 'Smoked Chicken', 'Fermented Fish', 'Dry Prawns', 'Pork Sausage', 'Smoked Buff', 'Sun Dried Meat', 'Traditional Fermented Meat'],
  cat_008: ['Naga Traditional Shawl', 'Assam Silk (Muga) Saree', 'Eri Silk Stole', 'Bamboo Water Bottle', 'Cane Basket', 'Handwoven Manipuri Phanek', 'Bamboo Tray', 'Mizo Puan', 'Wooden Handcrafts', 'Traditional Hat (Japi)'],
};

const products = [];
let prodId = 1;

CATEGORIES.forEach(cat => {
  const templates = ITEM_TEMPLATES[cat.id];
  cat.productCount = templates.length;
  cat.isActive = true;

  templates.forEach((itemName, index) => {
    const basePrice = Math.floor(Math.random() * 500) + 50;
    const isDiscounted = Math.random() > 0.5;

    products.push({
      id: `prod_${String(prodId).padStart(4, '0')}`,
      categoryId: cat.id,
      name: ` ${itemName}`,
      description: `Authentic and high quality ${itemName} sourced directly from the Northeast. Perfect for your daily needs and traditional recipes.`,
      shortDescription: `Authentic ${itemName}`,
      price: basePrice,
      discountPrice: isDiscounted ? Math.floor(basePrice * 0.8) : basePrice,
      unit: ['500g', '1kg', '250g', '1L', '1 Pack'][Math.floor(Math.random() * 5)],
      weight: 500,
      images: [cat.image],
      origin: ['Assam', 'Meghalaya', 'Nagaland', 'Arunachal Pradesh', 'Mizoram', 'Manipur', 'Sikkim', 'Tripura'][Math.floor(Math.random() * 8)],
      farmerOrSource: 'Local Farmer Network',
      ingredients: [itemName, 'Natural Preservatives'],
      nutritionalInfo: { calories: 120, protein: '5g', carbs: '20g' },
      stock: Math.floor(Math.random() * 200) + 10,
      rating: Number((Math.random() * 1 + 4).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 500) + 10,
      isOrganic: Math.random() > 0.3,
      isFeatured: Math.random() > 0.8,
      tags: ['northeast', 'authentic', 'premium'],
      createdAt: new Date().toISOString()
    });
    prodId++;
  });
});

const featuredProducts = products.filter(p => p.isFeatured).slice(0, 8).map((p, index) => ({
  productId: p.id,
  priority: index + 1,
  bannerText: `Top Pick: ${p.name}`
}));

const cart = {
  cartId: 'cart_001',
  userId: 'user_001',
  items: [
    { productId: products[0].id, quantity: 2, price: products[0].discountPrice },
    { productId: products[10].id, quantity: 1, price: products[10].discountPrice }
  ],
  totalAmount: (products[0].discountPrice * 2) + products[10].discountPrice
};

const orders = [
  {
    orderId: 'ord_001',
    userId: 'user_001',
    items: [{ productId: products[2].id, quantity: 1, price: products[2].discountPrice }],
    totalAmount: products[2].discountPrice,
    status: 'DELIVERED',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    orderId: 'ord_002',
    userId: 'user_001',
    items: [{ productId: products[5].id, quantity: 3, price: products[5].discountPrice }],
    totalAmount: products[5].discountPrice * 3,
    status: 'PREPARING',
    createdAt: new Date().toISOString()
  }
];

fs.mkdirSync(path.join(__dirname, '../src/data'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../src/data/categories.json'), JSON.stringify(CATEGORIES, null, 2));
fs.writeFileSync(path.join(__dirname, '../src/data/products.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(__dirname, '../src/data/featuredProducts.json'), JSON.stringify(featuredProducts, null, 2));
fs.writeFileSync(path.join(__dirname, '../src/data/cart.json'), JSON.stringify(cart, null, 2));
fs.writeFileSync(path.join(__dirname, '../src/data/orders.json'), JSON.stringify(orders, null, 2));

console.log('JSON data successfully generated in src/data/');

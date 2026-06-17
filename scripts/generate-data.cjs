const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  { id: 'cat_001', name: 'Fresh Vegetables', description: 'Fresh farm vegetables sourced from Northeast farms', image: '/src/assets/Veg.png', bannerImage: '/src/assets/Veg.png' },
  { id: 'cat_002', name: 'Fresh Fruits', description: 'Seasonal and exotic fruits from the Northeast hills', image: '/src/assets/Fruit.png', bannerImage: '/src/assets/Fruit.png' },
  { id: 'cat_003', name: 'Northeast Tea', description: 'Authentic Assam, Darjeeling and herbal teas', image: '/src/assets/tea.png', bannerImage: '/src/assets/tea.png' },
  { id: 'cat_004', name: 'Handmade Foods', description: 'Traditional smoked meats and sweets', image: '/src/assets/food.png', bannerImage: '/src/assets/food.png' },
  { id: 'cat_005', name: 'Pickles', description: 'Spicy King Chilli and Bamboo shoot pickles', image: '/src/assets/pickle.png', bannerImage: '/src/assets/pickle.png' },
  { id: 'cat_006', name: 'Traditional Snacks', description: 'Local rice snacks and handmade cookies', image: '/src/assets/snaks.png', bannerImage: '/src/assets/snaks.png' },
  { id: 'cat_007', name: 'Rice and Grains', description: 'Organic Joha, Black rice and sticky rice', image: '/src/assets/rice.png', bannerImage: '/src/assets/rice.png' },
  { id: 'cat_008', name: 'Spices and Masala', description: 'Pure Lakadong turmeric and Bhut Jolokia', image: '/src/assets/spices.png', bannerImage: '/src/assets/spices.png' },
  { id: 'cat_009', name: 'Organic Products', description: 'Wild forest honey and natural products', image: '/src/assets/organic.png', bannerImage: '/src/assets/organic.png' },
  { id: 'cat_010', name: 'Dairy Products', description: 'Fresh local dairy essentials', image: '/src/assets/milk.png', bannerImage: '/src/assets/milk.png' },
  { id: 'cat_011', name: 'Beverages', description: 'Local juices and healthy drinks', image: '/src/assets/juices.png', bannerImage: '/src/assets/juices.png' },
  { id: 'cat_012', name: 'Ready To Eat', description: 'Quick regional meals', image: '/src/assets/ready to eat.png', bannerImage: '/src/assets/ready to eat.png' },
  { id: 'cat_013', name: 'Dry Fruits and Nuts', description: 'Premium nuts and dry fruits', image: '/src/assets/dry feiuets.png', bannerImage: '/src/assets/dry feiuets.png' },
  { id: 'cat_014', name: 'Grocery Essentials', description: 'Daily grocery needs', image: '/src/assets/g.png', bannerImage: '/src/assets/g.png' },
  { id: 'cat_015', name: 'Household Essentials', description: 'Cleaning and home items', image: '/src/assets/household.png', bannerImage: '/src/assets/household.png' },
];

const ITEM_TEMPLATES = {
  cat_001: ['Bamboo Shoot', 'King Chilli', 'Local Spinach', 'Organic Tomato', 'Fresh Beans', 'Squash', 'Bitter Gourd', 'Taro Root', 'Mustard Greens', 'Brinjal'],
  cat_002: ['Khasi Mandarin', 'Pineapple', 'Kiwi', 'Dragon Fruit', 'Local Banana', 'Papaya', 'Guava', 'Passion Fruit', 'Plum', 'Peach'],
  cat_003: ['Assam Black Tea', 'Darjeeling First Flush', 'Green Tea Loose Leaf', 'Oolong Tea', 'White Tea', 'Chamomile Herbal', 'Lemongrass Tea', 'CTC Premium', 'Orthodox Blend', 'Masala Chai'],
  cat_004: ['Smoked Pork', 'Fermented Bamboo Shoot', 'Traditional Rice Cake', 'Sesame Ladoo', 'Jaggery Sweets', 'Dry Fish', 'Fermented Soybean', 'Handmade Noodles', 'Sticky Rice Cake', 'Smoked Beef'],
  cat_005: ['Bhut Jolokia Pickle', 'Bamboo Shoot Pickle', 'Mixed Veg Pickle', 'Pork Pickle', 'Beef Pickle', 'Garlic Pickle', 'Mango Pickle', 'Lemon Pickle', 'Green Chilli Pickle', 'Fish Pickle'],
  cat_006: ['Pitha', 'Til Pitha', 'Rice Crackers', 'Handmade Cookies', 'Roasted Makhana', 'Banana Chips', 'Tapioca Chips', 'Fried Dal', 'Nimki', 'Sweet Murku'],
  cat_007: ['Joha Rice', 'Black Rice', 'Red Rice', 'Sticky Rice', 'Bora Saul', 'Organic Basmati', 'Brown Rice', 'Millet', 'Quinoa', 'Local Wheat'],
  cat_008: ['Lakadong Turmeric', 'Naga Chilli Powder', 'Cumin Powder', 'Coriander Powder', 'Garam Masala', 'Black Pepper', 'Cardamom', 'Cinnamon', 'Cloves', 'Mustard Seeds'],
  cat_009: ['Wild Forest Honey', 'Organic Jaggery', 'Cold Pressed Mustard Oil', 'Amla Powder', 'Moringa Powder', 'Organic Ghee', 'Tulsi Drops', 'Aloe Vera Gel', 'Natural Soap', 'Bamboo Toothbrush'],
  cat_010: ['Fresh Cow Milk', 'Buffalo Milk', 'Local Paneer', 'Fresh Butter', 'Ghee', 'Curd', 'Cheese', 'Flavored Milk', 'Buttermilk', 'Cream'],
  cat_011: ['Local Orange Juice', 'Pineapple Juice', 'Passion Fruit Squash', 'Lemonade', 'Coconut Water', 'Kombucha', 'Aloe Vera Juice', 'Amla Juice', 'Rhododendron Squash', 'Buransh Juice'],
  cat_012: ['Instant Noodles', 'Ready Poha', 'Upma Mix', 'Khichdi Mix', 'Instant Soup', 'Ready to Eat Dal', 'Pre-cooked Rice', 'Millet Porridge', 'Oats Mix', 'Ready Chana Masala'],
  cat_013: ['Cashews', 'Almonds', 'Walnuts', 'Raisins', 'Pistachios', 'Dried Figs', 'Dates', 'Apricots', 'Fox Nuts', 'Mixed Seeds'],
  cat_014: ['Toor Dal', 'Moong Dal', 'Chana Dal', 'Sugar', 'Salt', 'Atta', 'Maida', 'Besan', 'Cooking Oil', 'Poha'],
  cat_015: ['Dishwash Liquid', 'Floor Cleaner', 'Detergent Powder', 'Toilet Cleaner', 'Garbage Bags', 'Tissue Paper', 'Hand Wash', 'Room Freshener', 'Sponges', 'Broom'],
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

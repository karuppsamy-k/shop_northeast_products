const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
let serviceAccount;
try {
  serviceAccount = require('../serviceAccountKey.json');
} catch (e) {
  console.error("ERROR: serviceAccountKey.json not found in the root directory.");
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Default image helper
const getProductImageUrl = (imageUrl, category) => {
  if (imageUrl && imageUrl.trim() !== '') return imageUrl;
  const cat = (category || '').toLowerCase();
  
  // Create a default string based on category, matching the frontend logic
  // e.g. /defaults/category.webp
  return `/defaults/${cat}.webp`;
};

async function main() {
  console.log("=== CSV to Firebase Products Migration Script ===");

  const csvFilePath = path.resolve(__dirname, '../src/data/Book(Dry Vegetables).csv');
  if (!fs.existsSync(csvFilePath)) {
    console.error(`ERROR: CSV file not found at ${csvFilePath}`);
    process.exit(1);
  }

  try {
    console.log('1. Deleting existing products...');
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    
    // Delete in batches of 500 (Firestore limit)
    let deleteBatch = db.batch();
    let deleteCount = 0;
    
    for (const doc of snapshot.docs) {
      deleteBatch.delete(doc.ref);
      deleteCount++;
      
      if (deleteCount % 500 === 0) {
        await deleteBatch.commit();
        deleteBatch = db.batch();
        console.log(`Deleted ${deleteCount} products...`);
      }
    }
    
    if (deleteCount % 500 !== 0) {
      await deleteBatch.commit();
    }
    console.log(`Successfully deleted all ${deleteCount} old products.`);

    console.log('2. Reading CSV file...');
    const results = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    console.log(`Found ${results.length} rows in CSV.`);

    // 4. Validate and prepare documents
    const newProducts = [];
    let skippedCount = 0;

    results.forEach((row, index) => {
      const name = row['Product Name'];
      let priceRaw = row['Price (?)'] || row['Price (₹)'] || row['Price'];
      const categoryRaw = row['Category'];
      const statusRaw = row['Status'];
      const description = row['Description'] || '';
      const weight = row['Weight/Specification'] || '';
      
      if (!name || !categoryRaw) {
        console.warn(`Row ${index + 2} skipped: Missing required fields (name, category). Data:`, row);
        skippedCount++;
        return;
      }

      // Handle missing price
      if (!priceRaw || isNaN(Number(priceRaw))) {
        priceRaw = 100; // Default price if missing
      }

      const price = Number(priceRaw);
      
      const category = String(categoryRaw).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const imageUrl = getProductImageUrl('', category);
      
      // Treat "Currently Unavailable" as inactive
      const isActive = statusRaw !== 'Currently Unavailable';

      const slug = name.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const id = `prod_${slug}_${index}`;

      newProducts.push({
        id,
        name: String(name),
        price,
        offer: null,
        finalPrice: price,
        category,
        imageUrl,
        isActive,
        description: description,
        weightSpecification: weight,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    console.log(`Prepared ${newProducts.length} products for insertion.`);
    
    let writeBatch = db.batch();
    let writeCount = 0;

    for (const prod of newProducts) {
      const docRef = productsRef.doc(prod.id);
      writeBatch.set(docRef, prod);
      writeCount++;

      if (writeCount % 500 === 0) {
        await writeBatch.commit();
        writeBatch = db.batch();
        console.log(`Inserted ${writeCount} products...`);
      }
    }

    if (writeCount % 500 !== 0) {
      await writeBatch.commit();
    }

    console.log('=== Migration Complete ===');
    console.log(`Total Rows Processed: ${results.length}`);
    console.log(`Successfully Written: ${writeCount}`);
    console.log(`Skipped Rows: ${skippedCount}`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

main();

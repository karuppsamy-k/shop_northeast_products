// scripts/migrate.js
/**
 * Standalone Migration Script: Excel to Firestore
 * 
 * Pre-requisites:
 * 1. Install dependencies: npm install xlsx firebase-admin
 * 2. Get your Firebase Service Account Key JSON from Firebase Console -> Project Settings -> Service Accounts.
 * 3. Save it as `serviceAccountKey.json` in the project root.
 * 4. Run the script: node scripts/migrate.js
 */

const xlsx = require('xlsx');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

// 1. Initialize Firebase Admin
let serviceAccount;
try {
  serviceAccount = require('../serviceAccountKey.json');
} catch (e) {
  console.error("ERROR: serviceAccountKey.json not found in the root directory.");
  console.error("Please download it from Firebase Console -> Project Settings -> Service Accounts and place it in the root folder.");
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Default images configuration (mirrors the React app's util)
const DEFAULT_CATEGORY_IMAGES = {
  "handicrafts": "/defaults/handicrafts.webp",
  "textiles": "/defaults/textiles.webp",
  "food": "/defaults/food.webp",
  "tea": "/defaults/tea.webp",
  "spices": "/defaults/spices.webp",
  "default": "/defaults/generic-product.webp"
};

const getProductImageUrl = (imageUrl, category) => {
  if (imageUrl && imageUrl.trim() !== '') return imageUrl;
  const cat = (category || '').toLowerCase();
  return DEFAULT_CATEGORY_IMAGES[cat] || DEFAULT_CATEGORY_IMAGES['default'];
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const excelFilePath = path.resolve(__dirname, '../src/components/ui/Book1.xlsx');

async function main() {
  console.log("=== Firebase Products Migration Script ===");

  if (!fs.existsSync(excelFilePath)) {
    console.error(`ERROR: Excel file not found at ${excelFilePath}`);
    process.exit(1);
  }

  // 2. Ask for confirmation before deleting existing products
  rl.question('WARNING: This will DELETE all existing documents in the "products" collection. Are you sure? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('Aborted.');
      process.exit(0);
    }

    try {
      console.log('Deleting existing products...');
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

      // 3. Read Excel File
      console.log('Reading Excel file...');
      const workbook = xlsx.readFile(excelFilePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Assuming headers are: Name, Price, Offer, Category, ImageUrl
      const rows = xlsx.utils.sheet_to_json(sheet);
      
      console.log(`Found ${rows.length} rows in Excel.`);

      // 4. Validate and prepare documents
      const newProducts = [];
      let skippedCount = 0;

      rows.forEach((row, index) => {
        const name = row['Product Name'] || row['Name'] || row['name'];
        let priceRaw = row['Price'] || row['price'];
        const categoryRaw = row['Category'] || row['category'];
        
        if (!name || !categoryRaw) {
          console.warn(`Row ${index + 2} skipped: Missing required fields (name, category). Data:`, row);
          skippedCount++;
          return;
        }

        // If price is missing from the excel, assign a default random price between 99 and 499
        if (!priceRaw || isNaN(Number(priceRaw))) {
          priceRaw = Math.floor(Math.random() * 400) + 99;
        }

        const price = Number(priceRaw);
        const offer = row['Offer'] || row['offer'] ? Number(row['Offer'] || row['offer']) : null;
        let finalPrice = price;
        if (offer) {
          // Assuming offer is a percentage
          finalPrice = Math.round(price - (price * (offer / 100)));
        }

        const category = String(categoryRaw).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const imageUrlRaw = row['ImageUrl'] || row['imageUrl'] || row['image'] || row['Image'] || '';
        const imageUrl = getProductImageUrl(imageUrlRaw, category);

        // Generate a stable ID based on name slug to prevent duplicates on rerun
        const slug = name.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const id = `prod_${slug}_${index}`;

        newProducts.push({
          id,
          name: String(name),
          price,
          offer,
          finalPrice,
          category,
          imageUrl,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });

      // 5. Bulk write to Firestore using batched writes
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
      console.log(`Total Rows Processed: ${rows.length}`);
      console.log(`Successfully Written: ${writeCount}`);
      console.log(`Skipped Rows: ${skippedCount}`);

    } catch (error) {
      console.error("Migration failed:", error);
    } finally {
      process.exit(0);
    }
  });
}

main();

const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

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

const getProductImageUrl = (imageUrl, category) => {
  if (imageUrl && imageUrl.trim() !== '') return imageUrl;
  const cat = (category || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return `/defaults/${cat}.webp`;
};

async function main() {
  console.log("=== TSV to Firebase Products Migration Script ===");

  const tsvFilePath = path.resolve(__dirname, 'all_other_sheets.tsv');
  if (!fs.existsSync(tsvFilePath)) {
    console.error(`ERROR: TSV file not found at ${tsvFilePath}`);
    process.exit(1);
  }

  try {
    const productsRef = db.collection('products');
    
    // Read the file manually since it's tab-separated with weird headers mixed in
    const fileContent = fs.readFileSync(tsvFilePath, 'utf-8');
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const newProducts = [];
    let skippedCount = 0;

    let currentCategory = 'Other';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split('\t').map(c => c.trim());
      
      // Handle category headers like "Category: Preserved Fruits (Dry)"
      if (cols[0].startsWith('Category:')) {
        currentCategory = cols[0].replace('Category:', '').trim();
        continue;
      }

      // Skip table headers
      if (cols[0] === 'S.No' || cols[1] === 'Product Name') {
        continue;
      }
      
      // Skip empty or malformed
      if (cols.length < 4) {
        console.log("Skipping short line:", line);
        skippedCount++;
        continue;
      }

      let name, categoryRaw, weight, priceRaw, description, statusRaw;
      
      // If it's a 4-column row under Currently Unavailable Products
      // S.No | Product Name | Weight/Specification | Price
      if (cols.length === 4 || (cols.length === 5 && !cols[4])) {
        name = cols[1];
        categoryRaw = 'Fresh Vegetables'; // Hardcoded based on context
        weight = cols[2];
        priceRaw = cols[3];
        description = '';
        statusRaw = 'Currently Unavailable';
      } else if (cols.length >= 8 && cols[2] === 'Other Collections') {
        name = cols[1];
        categoryRaw = cols[2];
        weight = cols[4];
        priceRaw = cols[5];
        description = cols[6];
        statusRaw = cols[7];
      } else {
        name = cols[1];
        categoryRaw = cols[2];
        weight = cols[3];
        priceRaw = cols[4];
        description = cols[5] || '';
        statusRaw = cols[6] || 'Available'; 
      }

      if (!name || !categoryRaw) {
        console.warn(`Skipping missing required fields: ${line}`);
        skippedCount++;
        continue;
      }
      
      // Price parsing
      priceRaw = String(priceRaw).replace(/[^0-9.]/g, ''); // Remove non-numeric chars
      const price = parseFloat(priceRaw) || 100;

      const category = String(categoryRaw).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const imageUrl = getProductImageUrl('', category);
      
      const isActive = statusRaw !== 'Currently Unavailable';

      const slug = name.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const id = `prod_${slug}_${Math.floor(Math.random() * 100000)}`;

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
    }

    console.log(`Prepared ${newProducts.length} new products for insertion.`);
    
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
    console.log(`Successfully Appended: ${writeCount}`);
    console.log(`Skipped Rows: ${skippedCount}`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

main();

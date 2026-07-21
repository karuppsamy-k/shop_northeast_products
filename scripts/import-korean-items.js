import { readFile } from 'fs/promises';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import xlsx from 'xlsx';
import path from 'path';

// Helper to create URL-friendly slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

async function main() {
  try {
    // 1. Initialize Firebase Admin
    const serviceAccountPath = path.resolve('./serviceAccountKey.json');
    const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'));
    
    initializeApp({
      credential: cert(serviceAccount)
    });
    const db = getFirestore();
    console.log('Firebase initialized successfully.');

    // 2. Read Excel File
    const workbook = xlsx.readFile('./src/assets/Korean_Items.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet);
    
    console.log(`Found ${rawData.length} items in the Excel sheet.`);

    // 3. Prepare Batch Upload
    let batch = db.batch();
    let count = 0;
    let totalUploaded = 0;
    const productsRef = db.collection('products');

    for (const item of rawData) {
      const categoryRaw = item['Category'] || 'Uncategorized';
      const itemName = item['Item Name'] || 'Unknown Item';
      
      const categorySlug = slugify(categoryRaw);
      
      // Generate a unique ID similar to how the app does it
      const docId = `prod_korean_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const docRef = productsRef.doc(docId);
      
      const productData = {
        id: docId,
        name: itemName,
        category: categorySlug,
        price: 0,
        offer: null,
        finalPrice: 0,
        imageUrl: '',
        isActive: false, // Inactive by default
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      batch.set(docRef, productData);
      count++;
      totalUploaded++;

      // Firestore batches can only have up to 500 operations. 
      // We have 99 items, but it's good practice to commit in chunks anyway.
      if (count === 400) {
        await batch.commit();
        console.log(`Committed batch of ${count} items...`);
        batch = db.batch();
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${count} items.`);
    }

    console.log(`Successfully uploaded ${totalUploaded} items to Firestore.`);
    process.exit(0);

  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

main();

import { readFile } from 'fs/promises';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

async function main() {
  try {
    const serviceAccountPath = path.resolve('./serviceAccountKey.json');
    const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'));
    
    initializeApp({
      credential: cert(serviceAccount)
    });
    const db = getFirestore();
    console.log('Firebase initialized. Fetching products...');

    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    
    let batch = db.batch();
    let count = 0;
    let batchCount = 0;
    
    for (const doc of snapshot.docs) {
      batch.update(doc.ref, { stockQuantity: 10 });
      count++;
      
      // Firestore batches can only have 500 operations
      if (count % 500 === 0) {
        await batch.commit();
        batch = db.batch();
        batchCount++;
        console.log(`Committed batch ${batchCount} (${count} total products updated)`);
      }
    }

    if (count % 500 !== 0) {
      await batch.commit();
      console.log(`Committed final batch (${count} total products updated)`);
    }

    console.log(`Successfully updated ${count} items with stockQuantity: 10.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

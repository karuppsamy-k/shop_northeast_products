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
    console.log('Firebase initialized. Fetching Korean products...');

    // Fetch products
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    
    let batch = db.batch();
    let count = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      // Only update products that we added via the script (they start with prod_korean_)
      // OR products that have price 0 and isActive false (to be safe)
      if (doc.id.startsWith('prod_korean_') && data.isActive === false) {
        batch.update(doc.ref, { isActive: true });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
      console.log(`Successfully activated ${count} Korean items.`);
    } else {
      console.log('No inactive Korean items found to update.');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

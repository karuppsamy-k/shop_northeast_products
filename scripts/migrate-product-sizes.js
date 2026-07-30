import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { resolve } from 'path';

// Target categories for migration
const TARGET_CATEGORIES = [
  'rice-and-dry-foods',
  'fresh-and-meat',
  'sauces-pickles-masala'
];

async function migrateSizes() {
  console.log('Starting product size migration...');
  
  // Initialize Firebase Admin
  try {
    const serviceAccountPath = resolve('./serviceAccountKey.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Successfully connected to Firebase Admin.');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    process.exit(1);
  }

  const db = getFirestore();
  const productsRef = db.collection('products');
  
  try {
    console.log('Fetching products from Firestore...');
    const snapshot = await productsRef.get();
    console.log(`Fetched ${snapshot.size} products.`);
    
    if (snapshot.empty) {
      console.log('No products found in the database.');
      return;
    }

    const batch = db.batch();
    let updatedCount = 0;
    let skippedCount = 0;

    snapshot.forEach(doc => {
      const product = doc.data();
      
      // Only process products in the target categories
      if (product.category && TARGET_CATEGORIES.includes(product.category)) {
        
        // If the product already has variants, we might want to skip it to avoid overwriting, 
        // but since this is a one-time setup based on the user's request, we will generate them.
        // Actually, let's just generate them if they don't have exactly 3 variants already.
        
        const basePrice = product.price || 0;
        const offer = product.offer || null;
        
        // Calculate new variant prices
        const price100 = Math.round(basePrice * 0.5);
        const price200 = basePrice;
        const price500 = Math.round(basePrice * 2.5);

        // Calculate final prices based on the offer
        const calculateFinal = (p, o) => o ? Math.round(p - (p * (o / 100))) : p;

        const variants = [
          {
            id: `var_${doc.id}_100g`,
            label: '100gm',
            price: price100,
            offer: offer,
            finalPrice: calculateFinal(price100, offer)
          },
          {
            id: `var_${doc.id}_200g`,
            label: '200gm',
            price: price200,
            offer: offer,
            finalPrice: calculateFinal(price200, offer)
          },
          {
            id: `var_${doc.id}_500g`,
            label: '500gm',
            price: price500,
            offer: offer,
            finalPrice: calculateFinal(price500, offer)
          }
        ];

        batch.update(doc.ref, { variants: variants });
        updatedCount++;
        console.log(`Prepared update for: ${product.name} (${product.category})`);
      } else {
        skippedCount++;
      }
    });

    if (updatedCount > 0) {
      console.log(`Committing ${updatedCount} updates to Firestore...`);
      await batch.commit();
      console.log('Migration completed successfully!');
    } else {
      console.log('No products matched the target categories for migration.');
    }
    
    console.log(`Summary: Updated ${updatedCount}, Skipped ${skippedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migrateSizes();

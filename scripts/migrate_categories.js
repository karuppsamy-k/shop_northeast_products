import { readFile } from 'fs/promises';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

const mapToNewCategory = (oldCategory) => {
  const mapping = {
    // Fresh & Meat
    'fresh-vegetables': 'fresh-and-meat',
    'meat': 'fresh-and-meat',
    'teen-fish': 'fresh-and-meat',
    'shrimp-paste': 'fresh-and-meat',
    
    // Rice & Dry Foods
    'rice': 'rice-and-dry-foods',
    'dry-items': 'rice-and-dry-foods',
    'seeds': 'rice-and-dry-foods',
    'peanuts': 'rice-and-dry-foods',
    
    // Noodles & Instant Foods
    'cup-noodles': 'noodles-and-instant-foods',
    'noodles': 'noodles-and-instant-foods',
    'fermented-items': 'noodles-and-instant-foods',
    
    // Snacks & Biscuits
    'biscuits': 'snacks-and-biscuits',
    'cookies': 'snacks-and-biscuits',
    'rusk': 'snacks-and-biscuits',
    'crispy-crackers': 'snacks-and-biscuits',
    'bhujiya': 'snacks-and-biscuits',
    
    // Sweets & Chocolates
    'candys': 'sweets-and-chocolates',
    'chocolates': 'sweets-and-chocolates',
    'jellys': 'sweets-and-chocolates',
    'cakes': 'sweets-and-chocolates',
    
    // Sauces, Pickles & Masala
    'pickles': 'sauces-pickles-masala',
    'sauces': 'sauces-pickles-masala',
    'bmc-masala': 'sauces-pickles-masala',
    'powder': 'sauces-pickles-masala',
    'sweet-and-sour': 'sauces-pickles-masala',
    
    // Drinks & Beverages
    'soft-drinks': 'drinks-and-beverages',
    'energy-drinks': 'drinks-and-beverages',
    
    // Pan & Tobacco
    'beetle-nuts': 'pan-and-tobacco',
    'tobacco': 'pan-and-tobacco',
    
    // Personal Care
    'soap': 'personal-care',
    
    // Specialty & Others
    'mg5': 'specialty-and-others',
    'new-lauches': 'specialty-and-others',
  };

  return mapping[oldCategory] || 'specialty-and-others';
};

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
    
    const categoryCounts = {};
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const newCategory = mapToNewCategory(data.category);
      
      categoryCounts[newCategory] = (categoryCounts[newCategory] || 0) + 1;
      
      batch.update(doc.ref, { 
        category: newCategory,
        subCategory: '' 
      });
      
      count++;
      
      if (count % 500 === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }

    if (count > 0 && count % 500 !== 0) {
      await batch.commit();
    }

    console.log(`\n=== Migration Summary ===`);
    console.log(`Total products scanned and updated: ${count}`);
    console.log(`\nDistribution:`);
    for (const [cat, num] of Object.entries(categoryCounts).sort((a,b) => b[1] - a[1])) {
      console.log(`  ${cat}: ${num}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

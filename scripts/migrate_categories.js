import { readFile } from 'fs/promises';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

const mapToNewCategory = (name, oldCategory) => {
  const n = name.toLowerCase();
  
  // Specific keyword matching
  if (n.includes('cup noodle') || n.includes('mami') || n.includes('mama')) return 'cup-noodles';
  if (n.includes('noodle') || n.includes('ramen') || n.includes('wai wai') || n.includes('thukpa')) return 'noodles';
  if (n.includes('cake')) return 'cakes';
  if (n.includes('rusk')) return 'rusk';
  if (n.includes('biscuit')) return 'biscuits';
  if (n.includes('cookie')) return 'cookies';
  if (n.includes('cracker')) return 'crispy-crackers';
  if (n.includes('candy') || n.includes('candies') || n.includes('lollipops') || n.includes('titora')) return 'candys';
  if (n.includes('chocolate')) return 'chocolates';
  if (n.includes('jelly')) return 'jellys';
  if (n.includes('bhujiya')) return 'bhujiya';
  if (n.includes('peanut')) return 'peanuts';
  if (n.includes('seed')) return 'seeds';
  if (n.includes('shrimp paste') || n.includes('ngari paste')) return 'shrimp-paste';
  if (n.includes('mg5')) return 'mg5';
  if (n.includes('bmc')) return 'bmc-masala';
  if (n.includes('powder')) return 'powder';
  if (n.includes('soap')) return 'soap';
  if (n.includes('tobacco') || n.includes('biri') || n.includes('sada') || n.includes('win') || n.includes('king size') || n.includes('cigarette')) return 'tobacco';
  if (n.includes('beetle nut') || n.includes('tamul')) return 'beetle-nuts';
  if (n.includes('tin') && (n.includes('fish') || n.includes('sardine') || n.includes('tuna') || n.includes('mackerel'))) return 'teen-fish';
  
  if (oldCategory === 'canned-fish-dry-fish') {
    if (n.includes('tin') || n.includes('can')) return 'teen-fish';
    return 'dry-items';
  }
  
  if (oldCategory === 'cold-drinks') {
    if (n.includes('energy') || n.includes('bull') || n.includes('shark')) return 'energy-drinks';
    return 'soft-drinks';
  }
  
  if (oldCategory === 'pickle-collection') {
    return 'pickles';
  }
  
  if (oldCategory === 'meat-collection') {
    return 'meat';
  }
  
  if (oldCategory === 'fermented-items') {
    return 'fermented-items';
  }
  
  if (oldCategory === 'rice-items') {
    return 'rice';
  }
  
  if (oldCategory === 'fresh-vegetables') {
    return 'fresh-vegetables';
  }
  
  if (oldCategory === 'spices') {
    if (n.includes('sauce') || n.includes('ketchup')) return 'sauces';
    return 'powder';
  }
  
  if (oldCategory === 'preserved-fruits-dry') {
    return 'sweet-and-sour';
  }
  
  if (oldCategory === 'tea-coffee') {
    return 'powder'; 
  }
  
  if (oldCategory === 'cookware-handicrafts') {
    return 'new-lauches';
  }
  
  if (oldCategory === 'edible') {
    if (n.includes('dry')) return 'dry-items';
    return 'new-lauches';
  }
  
  if (oldCategory === 'biscuit-items') {
    return 'biscuits';
  }
  
  if (oldCategory === 'noodle-items') {
    return 'noodles';
  }
  
  // Default fallback
  return 'new-lauches';
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
      const newCategory = mapToNewCategory(data.name, data.category);
      
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

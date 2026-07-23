import { readFile } from 'fs/promises';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

// Map ALL old database categories to the new category IDs
const CATEGORY_MAP = {
  // === From TSV import (exact matches) ===
  'canned-fish-dry-fish': { category: 'canned-fish-dry-fish', subCategory: '' },
  'cold-drinks':          { category: 'cold-drinks',          subCategory: '' },
  'cookware-handicrafts': { category: 'cookware-handicrafts', subCategory: '' },
  'edible':               { category: 'edible',               subCategory: '' },
  'preserved-fruits-dry': { category: 'preserved-fruits-dry', subCategory: '' },
  'tea-coffee':           { category: 'tea-coffee',           subCategory: '' },
  'fermented-items':      { category: 'fermented-items',      subCategory: '' },
  'fresh-vegetables':     { category: 'fresh-vegetables',     subCategory: '' },
  'meat-collection':      { category: 'meat-collection',      subCategory: '' },
  'pickle-items':         { category: 'pickle-collection',    subCategory: '' },
  'pickle-collection':    { category: 'pickle-collection',    subCategory: '' },
  'mix-collection':       { category: 'mix-collection',       subCategory: '' },
  'noodle-items':         { category: 'noodle-items',         subCategory: '' },
  'biscuit-items':        { category: 'biscuit-items',        subCategory: '' },
  'other-collections':    { category: 'mix-collection',       subCategory: 'Others' },
  'rice-items':           { category: 'rice-items',           subCategory: '' },
  'spices':               { category: 'spices',               subCategory: '' },

  // === Korean items (from Excel import) ===
  'noodles':              { category: 'noodle-items',         subCategory: 'Instant Noodles' },
  'snacks':               { category: 'edible',               subCategory: 'Crispy Snacks' },
  'sauces':               { category: 'spices',               subCategory: 'Seasonings' },
  'beverages':            { category: 'cold-drinks',          subCategory: '' },
  'candy':                { category: 'edible',               subCategory: 'Traditional Snacks' },
  'rice':                 { category: 'rice-items',           subCategory: '' },
  'tea':                  { category: 'tea-coffee',           subCategory: 'Tea' },
  'food':                 { category: 'edible',               subCategory: '' },
  'handicrafts':          { category: 'cookware-handicrafts', subCategory: '' },
  'textiles':             { category: 'mix-collection',       subCategory: 'Others' },

  // === Unmapped Korean categories (from previous run) ===
  'biscuits':             { category: 'biscuit-items',        subCategory: 'Biscuits' },
  'chocolate':            { category: 'edible',               subCategory: 'Traditional Snacks' },
  'confectionery':        { category: 'edible',               subCategory: 'Traditional Snacks' },
  'cookies':              { category: 'biscuit-items',        subCategory: 'Cookies' },
  'crackers':             { category: 'edible',               subCategory: 'Crispy Snacks' },
  'cup-noodles':          { category: 'noodle-items',         subCategory: 'Instant Noodles' },
  'curry':                { category: 'spices',               subCategory: 'Masala Mixes' },
  'drink':                { category: 'cold-drinks',          subCategory: '' },
  'dry-fruits':           { category: 'preserved-fruits-dry', subCategory: 'Dry Fruits' },
  'dry-vegetables':       { category: 'fresh-vegetables',     subCategory: 'Others' },
  'jelly':                { category: 'edible',               subCategory: 'Traditional Snacks' },
  'non-veg-pickles':      { category: 'pickle-collection',    subCategory: 'Meat Pickles' },
  'paste':                { category: 'spices',               subCategory: 'Seasonings' },
  'pickles':              { category: 'pickle-collection',    subCategory: '' },
  'ramen':                { category: 'noodle-items',         subCategory: 'Ramen' },
  'rice-cake':            { category: 'biscuit-items',        subCategory: 'Rice Cake' },
  'seaweed':              { category: 'edible',               subCategory: 'Crispy Snacks' },
  'tin-fish':             { category: 'canned-fish-dry-fish', subCategory: 'Canned Fish' },
  'tteokbokki':           { category: 'noodle-items',         subCategory: 'Others' },
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
    let batchCount = 0;
    let skipped = 0;
    
    const oldCategories = new Set();
    const unmappedCategories = new Set();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const oldCategory = data.category || '';
      oldCategories.add(oldCategory);
      
      const mapping = CATEGORY_MAP[oldCategory];
      
      if (!mapping) {
        unmappedCategories.add(oldCategory);
        batch.update(doc.ref, { 
          category: 'mix-collection',
          subCategory: 'Others'
        });
      } else {
        batch.update(doc.ref, { 
          category: mapping.category,
          subCategory: mapping.subCategory
        });
      }
      
      count++;
      
      if (count % 500 === 0) {
        await batch.commit();
        batch = db.batch();
        batchCount++;
        console.log(`Committed batch ${batchCount} (${count} products updated)`);
      }
    }

    if (count > 0 && count % 500 !== 0) {
      await batch.commit();
      console.log(`Committed final batch (${count} products updated)`);
    }

    console.log(`\n=== Migration Summary ===`);
    console.log(`Total products scanned: ${snapshot.size}`);
    console.log(`Products updated: ${count}`);
    console.log(`\nCategories mapped:`);
    for (const cat of [...oldCategories].sort()) {
      const mapped = CATEGORY_MAP[cat];
      console.log(`  "${cat}" → ${mapped ? mapped.category : 'mix-collection (UNMAPPED)'}`);
    }
    if (unmappedCategories.size > 0) {
      console.log(`\n⚠️  Unmapped categories (defaulted to mix-collection):`);
      for (const cat of unmappedCategories) {
        console.log(`  - "${cat}"`);
      }
    } else {
      console.log(`\n✅ All categories mapped successfully!`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

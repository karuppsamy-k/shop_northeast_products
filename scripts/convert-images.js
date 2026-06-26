const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDir = path.join(__dirname, '../public/assets');

async function convertImages(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await convertImages(fullPath);
    } else if (file.toLowerCase().endsWith('.png')) {
      const webpPath = fullPath.replace(/\.png$/i, '.webp');
      console.log(`Converting: ${fullPath} -> ${webpPath}`);
      try {
        await sharp(fullPath)
          .webp({ quality: 80 })
          .toFile(webpPath);
        fs.unlinkSync(fullPath); // delete old png
      } catch (e) {
        console.error(`Error converting ${file}:`, e);
      }
    }
  }
}

convertImages(targetDir).then(() => console.log('Done!'));

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BRAND_COLOR = '#002A4E';
const BORDER_WIDTH = 50;
const IMAGE_DIR = path.join(__dirname, 'public');

const images = [
  'physiotherapy-clinic-kilmarnock-1.jpeg',
  'physiotherapy-clinic-kilmarnock-2.jpeg'
];

async function processImages() {
  try {
    // Get metadata for both images
    const metadata = {};
    for (const img of images) {
      const filepath = path.join(IMAGE_DIR, img);
      metadata[img] = await sharp(filepath).metadata();
      console.log(`${img}: ${metadata[img].width}x${metadata[img].height}`);
    }

    // Find max dimensions
    const maxWidth = Math.max(...Object.values(metadata).map(m => m.width));
    const maxHeight = Math.max(...Object.values(metadata).map(m => m.height));
    console.log(`\nTarget size: ${maxWidth}x${maxHeight}`);

    // Process each image
    for (const img of images) {
      const filepath = path.join(IMAGE_DIR, img);
      const temppath = path.join(IMAGE_DIR, `temp-${img}`);
      
      // Resize to max dimensions, then add border
      await sharp(filepath)
        .resize(maxWidth, maxHeight, {
          fit: 'cover',
          position: 'center'
        })
        .extend({
          top: BORDER_WIDTH,
          bottom: BORDER_WIDTH,
          left: BORDER_WIDTH,
          right: BORDER_WIDTH,
          background: BRAND_COLOR
        })
        .toFile(temppath);
      
      // Replace original with processed file
      fs.renameSync(temppath, filepath);
      console.log(`✓ Processed ${img}`);
    }

    console.log(`\n✓ Both images now with ${BORDER_WIDTH}px ${BRAND_COLOR} border`);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

processImages();

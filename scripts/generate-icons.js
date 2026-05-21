const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/icon.svg');
const publicDir = path.join(__dirname, '../public');

async function generateIcons() {
  console.log('Generating PWA icons...');
  try {
    const svgBuffer = fs.readFileSync(svgPath);

    // 1. Standard 192x192 PNG
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✔ Generated icon-192.png');

    // 2. Standard 512x512 PNG
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✔ Generated icon-512.png');

    // 3. Maskable 192x192 PNG (requires padding/safe-zone so it can be cropped by OS into circle/squircle)
    // We construct a padded SVG for maskable icons
    const maskableSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
        <!-- Solid background to cover corners -->
        <rect width="512" height="512" fill="#e11d48" />
        <!-- Nested content scaled to 80% to be perfectly inside the safe circle -->
        <g transform="translate(51, 51) scale(0.8)">
          ${svgBuffer.toString().replace(/<\/?svg[^>]*>/g, '')}
        </g>
      </svg>
    `;
    const maskableBuffer = Buffer.from(maskableSvg);

    await sharp(maskableBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-maskable-192.png'));
    console.log('✔ Generated icon-maskable-192.png');

    await sharp(maskableBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-maskable-512.png'));
    console.log('✔ Generated icon-maskable-512.png');

    console.log('🎉 PWA Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();

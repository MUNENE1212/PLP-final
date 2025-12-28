import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logo paths
const LOGO_PATH = path.resolve(__dirname, '../../LOGO.jpg');
const OUTPUT_DIR = path.resolve(__dirname, '../public/pwa-icons');
const FAVICON_DIR = path.resolve(__dirname, '../public/favicons');

// Ensure output directories exist
[OUTPUT_DIR, FAVICON_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function generateIcons() {
  console.log('🎨 Generating Dumu Waks icons from LOGO.jpg...\n');

  const sizes = [
    { size: 72, name: 'icon-72x72.png' },
    { size: 96, name: 'icon-96x96.png' },
    { size: 128, name: 'icon-128x128.png' },
    { size: 144, name: 'icon-144x144.png' },
    { size: 152, name: 'icon-152x152.png' },
    { size: 192, name: 'icon-192x192.png' },
    { size: 384, name: 'icon-384x384.png' },
    { size: 512, name: 'icon-512x512.png' },
  ];

  const faviconSizes = [
    { size: 180, name: 'apple-touch-icon.png', dir: FAVICON_DIR },
    { size: 32, name: 'favicon-32x32.png', dir: FAVICON_DIR },
    { size: 16, name: 'favicon-16x16.png', dir: FAVICON_DIR },
    { size: 152, name: 'apple-touch-icon-152x152.png', dir: FAVICON_DIR },
    { size: 167, name: 'apple-touch-icon-167x167.png', dir: FAVICON_DIR },
    { size: 192, name: 'android-chrome-192x192.png', dir: FAVICON_DIR },
    { size: 512, name: 'android-chrome-512x512.png', dir: FAVICON_DIR },
    { size: 96, name: 'favicon-96x96.png', dir: FAVICON_DIR },
    { size: 144, name: 'mstile-144x144.png', dir: FAVICON_DIR },
  ];

  // Generate PWA icons
  console.log('📱 Generating PWA icons...');
  for (const { size, name } of sizes) {
    try {
      await sharp(LOGO_PATH)
        .resize(size, size, { fit: 'cover', position: 'center' })
        .png({ quality: 90 })
        .toFile(path.join(OUTPUT_DIR, name));
      console.log(`  ✅ Generated ${name}`);
    } catch (error) {
      console.error(`  ❌ Failed to generate ${name}:`, error.message);
    }
  }

  // Generate favicons
  console.log('\n🔖 Generating favicons...');
  for (const { size, name, dir } of faviconSizes) {
    try {
      await sharp(LOGO_PATH)
        .resize(size, size, { fit: 'cover', position: 'center' })
        .png({ quality: 90 })
        .toFile(path.join(dir, name));
      console.log(`  ✅ Generated ${name}`);
    } catch (error) {
      console.error(`  ❌ Failed to generate ${name}:`, error.message);
    }
  }

  // Copy logo to public directory for easy access
  console.log('\n📋 Copying logo to public directory...');
  try {
    await sharp(LOGO_PATH)
      .png({ quality: 90 })
      .toFile(path.resolve(__dirname, '../public/LOGO.png'));
    console.log('  ✅ Generated LOGO.png');

    // Generate a square version for QR codes
    await sharp(LOGO_PATH)
      .resize(512, 512, { fit: 'cover', position: 'center' })
      .png({ quality: 90 })
      .toFile(path.resolve(__dirname, '../public/LOGO-square.png'));
    console.log('  ✅ Generated LOGO-square.png for QR codes');
  } catch (error) {
    console.error('  ❌ Failed to copy logo:', error.message);
  }

  // Generate favicon.ico (requires special handling)
  console.log('\n🌐 Generating favicon.ico...');
  try {
    // For simplicity, we'll create a 32x32 ICO file
    await sharp(LOGO_PATH)
      .resize(32, 32, { fit: 'cover', position: 'center' })
      .toFile(path.resolve(__dirname, '../public/favicon.ico'));
    console.log('  ✅ Generated favicon.ico');
  } catch (error) {
    console.error('  ❌ Failed to generate favicon.ico:', error.message);
  }

  console.log('\n🎉 All icons generated successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - PWA Icons: ${sizes.length} files in /public/pwa-icons/`);
  console.log(`  - Favicon Icons: ${faviconSizes.length} files in /public/favicons/`);
  console.log('  - Logo files: LOGO.png, LOGO-square.png in /public/');
}

generateIcons().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

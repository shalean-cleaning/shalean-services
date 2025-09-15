const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createFavicon() {
  try {
    // Assuming you have a logo.png file in the project root
    const inputPath = path.join(__dirname, 'logo.png');
    const outputPath = path.join(__dirname, 'src', 'app', 'favicon.ico');
    
    if (!fs.existsSync(inputPath)) {
      console.log('Please place your logo.png file in the project root');
      return;
    }
    
    // Create favicon with multiple sizes
    const sizes = [16, 32, 48, 64, 128, 256];
    
    // For ICO format, we'll create a simple conversion
    // Note: sharp doesn't directly support ICO, so we'll create PNG and suggest conversion
    for (const size of sizes) {
      await sharp(inputPath)
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, `favicon-${size}x${size}.png`));
    }
    
    console.log('Favicon PNG files created. Use an online converter to create favicon.ico');
    console.log('Or replace src/app/favicon.ico with your generated file');
    
  } catch (error) {
    console.error('Error creating favicon:', error);
  }
}

createFavicon();

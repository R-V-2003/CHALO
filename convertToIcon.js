const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgFile = path.resolve(__dirname, 'public/icons/Auto Rickshaw.svg');
const assetsDir = path.resolve(__dirname, 'assets');

if (!fs.existsSync(assetsDir)){
    fs.mkdirSync(assetsDir);
}

const svgBuffer = fs.readFileSync(svgFile);

async function convert() {
  try {
    // Generate Icon.png
    await sharp(svgBuffer)
      .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(path.join(assetsDir, 'icon.png'));
    
    // Generate Splash.png
    await sharp(svgBuffer)
      .resize(2732, 2732, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(path.join(assetsDir, 'splash.png'));
      
    console.log('Successfully generated assets/icon.png and assets/splash.png');
  } catch (error) {
    console.error('Error generating assets:', error);
  }
}

convert();

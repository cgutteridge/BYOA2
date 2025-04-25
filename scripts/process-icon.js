#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Check if icon name was provided
if (process.argv.length < 3) {
  console.error('Usage: npm run process-icon <icon-name>');
  process.exit(1);
}

// Get icon name from command line argument (without extension)
const iconName = process.argv[2].replace('.png', '');
const iconPath = path.join(projectRoot, 'public', 'newicons', `${iconName}.png`);

// Check if icon exists
if (!fs.existsSync(iconPath)) {
  console.error(`Icon ${iconPath} does not exist`);
  process.exit(1);
}

// Create directories if they don't exist
const shadowDir = path.join(projectRoot, 'public', 'newicons', 'shadows');
const infoDir = path.join(projectRoot, 'public', 'newicons', 'iconinfo');

if (!fs.existsSync(shadowDir)) {
  fs.mkdirSync(shadowDir, { recursive: true });
}

if (!fs.existsSync(infoDir)) {
  fs.mkdirSync(infoDir, { recursive: true });
}

// Get image dimensions using ImageMagick
const getImageDimensions = (imagePath) => {
  const dimensionsOutput = execSync(`identify -format "%w %h" "${imagePath}"`).toString().trim();
  const [width, height] = dimensionsOutput.split(' ').map(Number);
  return { width, height };
};

// Get original image dimensions
const originalDimensions = getImageDimensions(iconPath);
console.log(`Original dimensions: ${originalDimensions.width}x${originalDimensions.height}`);

// Calculate scaled dimensions (constrained to 64x64 while maintaining aspect ratio)
let scaledWidth, scaledHeight;
if (originalDimensions.width > originalDimensions.height) {
  scaledWidth = 64;
  scaledHeight = Math.round((originalDimensions.height / originalDimensions.width) * 64);
} else {
  scaledHeight = 64;
  scaledWidth = Math.round((originalDimensions.width / originalDimensions.height) * 64);
}

// Generate shadow image - proper shadow for Leaflet markers
const shadowPath = path.join(shadowDir, `${iconName}.png`);

// This command creates a shadow by:
// 1. Converting all pixels to black but preserving the alpha channel
// 2. Skewing the image
// 3. Adding blur and adjusting transparency
// 4. Ensuring a fully transparent background
const shadowCommand = `convert "${iconPath}" \\
  -fill black -colorize 100 \\
  -background none \\
  -shear 15x0 \\
  -blur 0x4 \\
  -alpha set -channel A -evaluate multiply 0.5 +channel \\
  -background none -flatten \\
  "${shadowPath}"`;

console.log('Generating shadow image...');
execSync(shadowCommand);

// Get shadow dimensions
const shadowDimensions = getImageDimensions(shadowPath);
console.log(`Shadow dimensions: ${shadowDimensions.width}x${shadowDimensions.height}`);

// Calculate scaled shadow dimensions
const scaledShadowWidth = Math.round(scaledWidth * (shadowDimensions.width / originalDimensions.width));
const scaledShadowHeight = Math.round(scaledHeight * (shadowDimensions.height / originalDimensions.height));

// Create the icon info JSON file
const iconInfo = {
  originalSize: {
    width: originalDimensions.width,
    height: originalDimensions.height
  },
  originalShadowSize: {
    width: shadowDimensions.width,
    height: shadowDimensions.height
  },
  scaledSize: {
    width: scaledWidth,
    height: scaledHeight
  },
  scaledShadowSize: {
    width: scaledShadowWidth,
    height: scaledShadowHeight
  }
};

const iconInfoPath = path.join(infoDir, `${iconName}.json`);
fs.writeFileSync(iconInfoPath, JSON.stringify(iconInfo, null, 2));

console.log(`
Processing complete for ${iconName}:
- Original size: ${originalDimensions.width}x${originalDimensions.height}
- Original shadow size: ${shadowDimensions.width}x${shadowDimensions.height}
- Scaled size (max 64x64): ${scaledWidth}x${scaledHeight}
- Scaled shadow size: ${scaledShadowWidth}x${scaledShadowHeight}
- Shadow saved to: ${shadowPath}
- Info saved to: ${iconInfoPath}
`); 
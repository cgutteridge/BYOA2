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
const iconPath = path.join(projectRoot, 'public', 'icons', `${iconName}.png`);

// Check if icon exists
if (!fs.existsSync(iconPath)) {
  console.error(`Icon ${iconPath} does not exist`);
  process.exit(1);
}

// Create shadows directory if it doesn't exist
const shadowDir = path.join(projectRoot, 'public', 'icons', 'shadows');

if (!fs.existsSync(shadowDir)) {
  fs.mkdirSync(shadowDir, { recursive: true });
}

// Path to locationTypes.json
const locationTypesPath = path.join(projectRoot, 'src', 'data', 'locationTypes.json');

// Check if locationTypes.json exists
if (!fs.existsSync(locationTypesPath)) {
  console.error(`locationTypes.json not found at ${locationTypesPath}`);
  process.exit(1);
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
// 2. Skewing the image with a dramatic angle
// 3. Adding blur and adjusting transparency to be half as opaque
// 4. Ensuring a fully transparent background
const shadowCommand = `convert "${iconPath}" \\
  -fill black -colorize 100 \\
  -background none \\
  -blur 0x5 \\
  -resample 100%x80% \\
  -shear 50x0 \\
  -alpha set -channel A -evaluate multiply 0.25 +channel \\
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

// Calculate anchor points (bottom center of the icon)
const anchorX = Math.floor(scaledWidth / 2);
const anchorY = scaledHeight;

// Calculate shadow anchor points (adjust based on the shadow position)
const shadowAnchorX = anchorX
const shadowAnchorY = scaledShadowHeight

// Read the locationTypes.json file
let locationTypes;
try {
  const fileContent = fs.readFileSync(locationTypesPath, 'utf8');
  locationTypes = JSON.parse(fileContent);
} catch (error) {
  console.error(`Error reading locationTypes.json: ${error.message}`);
  process.exit(1);
}

// Find or create the location type entry
let locationTypeEntry = locationTypes.find(location => location.id === iconName);
if (!locationTypeEntry) {
  // Create a new entry if not found
  locationTypeEntry = {
    id: iconName,
    title: iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/_/g, ' '),
    filename: `${iconName}.png`
  };
  locationTypes.push(locationTypeEntry);
  console.log(`Added new location type: ${iconName}`);
}

// Update the location type with scaling information
locationTypeEntry.scale = true;
locationTypeEntry.size = [scaledWidth, scaledHeight];
locationTypeEntry.anchor = [anchorX, anchorY];
locationTypeEntry.shadowAnchor = [shadowAnchorX, shadowAnchorY];
locationTypeEntry.shadowSize = [scaledShadowWidth, scaledShadowHeight];

// Write the updated locationTypes.json file
try {
  fs.writeFileSync(locationTypesPath, JSON.stringify(locationTypes, null, 2), 'utf8');
  console.log(`Updated locationTypes.json for ${iconName}`);
} catch (error) {
  console.error(`Error writing locationTypes.json: ${error.message}`);
  process.exit(1);
}

console.log(`
Processing complete for ${iconName}:
- Original size: ${originalDimensions.width}x${originalDimensions.height}
- Original shadow size: ${shadowDimensions.width}x${shadowDimensions.height}
- Scaled size (max 64x64): ${scaledWidth}x${scaledHeight}
- Scaled shadow size: ${scaledShadowWidth}x${scaledShadowHeight}
- Shadow saved to: ${shadowPath}
- locationTypes.json updated
`); 
#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Path to the newicons directory
const iconsDir = path.join(projectRoot, 'public', 'newicons');

// Get all icon files
const iconFiles = fs.readdirSync(iconsDir)
  .filter(file => 
    file.endsWith('.png') && 
    fs.statSync(path.join(iconsDir, file)).isFile()
  )
  .map(file => file.replace('.png', ''));

console.log(`Found ${iconFiles.length} icons to process`);

// Process each icon
for (const iconName of iconFiles) {
  console.log(`\n--- Processing ${iconName} ---`);
  try {
    execSync(`npm run process-icon ${iconName}`, { stdio: 'inherit' });
    console.log(`✅ Successfully processed ${iconName}`);
  } catch (error) {
    console.error(`❌ Error processing ${iconName}:`, error);
  }
}

console.log('\nAll icons processed!'); 
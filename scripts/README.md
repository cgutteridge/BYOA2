# Icon Processing Script

This script processes map icons for the game by:
1. Finding the dimensions of the original icon
2. Creating a shadow version using ImageMagick
   - The shadow maintains the exact shape/silhouette of the original icon
   - All details are converted to solid black while preserving transparency
   - The shadow is horizontally skewed to create a realistic effect
   - Designed specifically for use with Leaflet map markers
3. Generating a JSON file with metadata for both original and scaled dimensions

## Prerequisites

- ImageMagick must be installed on your system

## Usage

To process a single icon, run:

```bash
npm run process-icon <icon-name>
```

For example:
```bash
npm run process-icon castle
```

To process all icons in the `public/newicons` directory:

```bash
npm run process-all-icons
```

## Output

The script will:
1. Create a shadow version in `public/newicons/shadows/<icon-name>.png`
   - The shadow maintains the exact shape of the original icon
   - The shadow is skewed horizontally (approx. 15 degrees)
   - The shadow is blurred slightly for a more realistic effect
   - The shadow has 50% opacity
2. Generate a JSON file with metadata in `public/newicons/iconinfo/<icon-name>.json`

The JSON file contains:
- Original icon dimensions
- Original shadow dimensions (will be wider than the original due to skewing)
- Scaled icon dimensions (constrained to 64x64 while maintaining aspect ratio)
- Scaled shadow dimensions (proportionally scaled to match the scaled icon)

## Leaflet Integration

These icons and their metadata are designed to be used with Leaflet markers. When creating a custom icon in Leaflet, you can use:
- The original icon as the iconUrl
- The shadow as the shadowUrl
- The scaled dimensions from the JSON file for iconSize and shadowSize

## Status

All icons have been successfully processed. The following icons have been processed:
- battlefield
- camp
- chest
- market
- players
- ruins
- statue
- temple
- tower 
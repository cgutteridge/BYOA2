import { toItemId, Item } from '../types';
import { generateRandomItem } from './generateRandomItem';

/**
 * Create demo items for testing with specific point values
 * Generates 6 random items for each point value from 1 to 10
 * @returns An array of demo items grouped by point value
 */
export function createDemoItems(): Item[] {
  const demoItems: Item[] = [];
  
  // Generate 6 random items for each point value from 1 to 10
  for (let points = 1; points <= 10; points++) {
    for (let i = 0; i < 6; i++) {
      const item = generateDemoItem(points);
      demoItems.push(item);
    }
  }
  
  return demoItems;
}

/**
 * Generate a demo item with a specific point value
 * @param points The point value for the item
 * @returns A demo item
 */
function generateDemoItem(points: number): Item {
  // Generate a random item of the specified level
  const randomItem = generateRandomItem(points);
  
  // Override the name and ID to indicate it's a demo item
  randomItem.id = toItemId(`demo_${points}pt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  randomItem.name = `DEMO ${points}pt ${randomItem.name}`;
  
  return randomItem;
} 
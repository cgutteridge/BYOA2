import { LocationDifficulty } from '../types';
import { monsterTypes } from '../data/monsterTypes';
import { generateRandomItem } from './generateRandomItem';
import { Item } from '../types/item';

// Define the Unit type if not exported from another module
interface Unit {
  type: string;
  // Add other properties as needed
}

/**
 * Generate a gift item based on location difficulty
 * @param difficulty The location difficulty
 * @returns An item or undefined if no gift should be generated
 */
export function generateGiftItem(difficulty: LocationDifficulty): Item | undefined {
  // Easy locations always have a level 1 gift
  if (difficulty === 'easy' || difficulty === 'start') {
    return generateRandomItem(1);
  }
  
  // Medium locations have a 50% chance of a level 2 gift
  if (difficulty === 'medium') {
    return Math.random() < 0.5 ? generateRandomItem(2) : undefined;
  }
  
  // Hard and end locations have no gift
  return undefined;
}

/**
 * Generate a prize item based on location difficulty
 * @param difficulty The location difficulty
 * @returns An item appropriate for the difficulty
 */
export function generatePrizeItem(difficulty: LocationDifficulty): Item {
  switch (difficulty) {
    case 'easy':
    case 'start':
      // Easy locations have level 2 prizes
      return generateRandomItem(2);
    case 'medium':
      // Medium locations have level 3 prizes
      return generateRandomItem(3);
    case 'hard':
    case 'end':
      // Hard and end locations have level 4 prizes
      return generateRandomItem(4);
    default:
      // Fallback to level 2
      return generateRandomItem(2);
  }
}

/**
 * Generate an item for a monster unit based on its level
 * @param unit The unit to generate an item for
 * @returns An item appropriate for the unit's level
 */
export function generateUnitItem(unit: Unit): Item | undefined {
  // Only generate an item with a 40% probability
  if (Math.random() > 0.4) {
    return undefined;
  }
  
  const monsterType = unit.type;
  // Find the monster info to get its level
  const monster = monsterTypes.find(m => m.id === monsterType);
  
  if (!monster) {
    return undefined;
  }
  
  // Generate item based on monster level
  switch (monster.level) {
    case 'minion':
      return generateRandomItem(1);
    case 'grunt':
      return generateRandomItem(2);
    case 'elite':
      return generateRandomItem(3);
    case 'boss':
      return generateRandomItem(4);
    default:
      return undefined;
  }
} 
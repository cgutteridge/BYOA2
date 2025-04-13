import { Item, LocationDifficulty, MonsterLevel, ItemTypeId, Unit } from '../types';
import { getItemTypesByLevel } from '../data/itemTypes';
import { monsterTypes } from '../data/monsterTypes';
import pickOne from './pickOne';

/**
 * Generate a gift item based on location difficulty
 * @param difficulty The location difficulty
 * @returns An item or undefined if no gift should be generated
 */
export function generateGiftItem(difficulty: LocationDifficulty): Item | undefined {
  // Easy locations always have a level 1 gift
  if (difficulty === 'easy' || difficulty === 'start') {
    return createRandomItem(1);
  }
  
  // Medium locations have a 50% chance of a level 2 gift
  if (difficulty === 'medium') {
    return Math.random() < 0.5 ? createRandomItem(2) : undefined;
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
      return createRandomItem(2);
    case 'medium':
      // Medium locations have level 3 prizes
      return createRandomItem(3);
    case 'hard':
    case 'end':
      // Hard and end locations have level 4 prizes
      return createRandomItem(4);
    default:
      // Fallback to level 2
      return createRandomItem(2);
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
      return createRandomItem(1);
    case 'grunt':
      return createRandomItem(2);
    case 'elite':
      return createRandomItem(3);
    case 'boss':
      return createRandomItem(4);
    default:
      return undefined;
  }
}

/**
 * Create a random item of the specified level
 * @param level The item level
 * @returns A randomly generated item
 */
function createRandomItem(level: number): Item {
  // Get all item types for the given level
  const itemTypeOptions: ItemTypeId[] = ['healing', 'transmute', 'kill'];
  
  // Select a random item type
  const type = pickOne(itemTypeOptions);
  
  // Get possible items of the selected type and level
  const itemTypes = getItemTypesByLevel(level, type);
  
  if (itemTypes.length === 0) {
    // Fallback if no matching item types
    return {
      type,
      name: `Level ${level} ${type} Item`,
      power: `A generic ${type} item of level ${level}`,
      uses: 1,
      level
    };
  }
  
  // Pick a random item from the available options
  const itemType = pickOne(itemTypes);
  
  // Create the item
  return {
    type: itemType.id,
    name: itemType.title,
    power: itemType.power,
    uses: 1, // Default to 1 use
    level: itemType.level
  };
} 
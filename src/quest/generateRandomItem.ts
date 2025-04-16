import type { Item, TargetMode } from '../types/item.ts';
import type { MonsterLevel, Species, MonsterFlag, ItemPowerId } from '../types';
import { toItemId } from '../types';
import { generateEffectDescription, getLevelQualityTerm } from './generateEffectDescription.ts';
import pickOne from "@/utils/pickOne.ts";
import { powerFactory } from "@/powers/index.ts";

// Available species for targeting
const AVAILABLE_SPECIES: Species[] = [
  'vampire', 'ghost', 'human', 'chameleonoid', 'goblinoid', 
  'elf', 'demonoid', 'dwarf', 'special', 'fey', 'elemental'
];

// Available flags for targeting
const AVAILABLE_FLAGS: MonsterFlag[] = [
  'spirit', 'undead', 'mortal', 'magic-user', 'group'
];

/**
 * Generate a random item of the specified level
 * @param level Item level (1-6)
 * @returns A random item with appropriate properties for the level
 */
export function generateRandomItem(level: number): Item {
  // Use level directly as points
  const totalPoints = level;
  
  // Track points spent
  let remainingPoints = totalPoints;
  
  // Step 1: Pick a random power type that fits within our budget
  // Get all power constants for base costs
  const powerConstants = powerFactory.getAllConstants();
  
  // Filter available powers based on cost
  const availablePowers = Object.entries(powerConstants)
    .filter(([_, constants]) => constants.baseCost <= remainingPoints)
    .map(([power]) => power as ItemPowerId);
    
  if (availablePowers.length === 0) {
    // Fallback to most basic power if no powers fit
    availablePowers.push('kill');
  }
  
  const selectedPower = pickOne(availablePowers);
  const power = powerFactory.getPower(selectedPower);
  if (!power) {
    throw new Error(`Power ${selectedPower} not found`);
  }
  
  remainingPoints -= power.baseCost;
  
  // Get default target mode
  const defaultTargetMode = power.defaultTargetMode;
  
  // Initialize item with default properties
  const item: Item = {
    id: toItemId(`random_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`),
    name: generateItemName(selectedPower, defaultTargetMode),
    uses: 1,
    power: selectedPower,
    level: level,
    target: defaultTargetMode,
    targetFilters: {
      levels: ['minion', 'grunt'] as MonsterLevel[],
    }
  };
  
  // Apply level-specific restrictions if any
  if (power.levelRestrictions) {
    item.targetFilters = {
      ...item.targetFilters,
      levels: power.levelRestrictions
    };
  }
  
  // Step 2: Apply target restrictions if applicable
  if (power.canHaveTargetRestriction && item.targetFilters) {
    // By default, add a species restriction (50%) or flag restriction (50%)
    if (Math.random() < 0.5) {
      item.targetFilters.species = [pickOne(AVAILABLE_SPECIES)];
    } else {
      item.targetFilters.flags = [pickOne(AVAILABLE_FLAGS)];
    }
  }
  
  // Step 3: Apply result restrictions if applicable
  if (power.canHaveResultRestriction) {
    // Default to a restricted result
    item.result = 'random';
    
    // Remove resultLevel and resultSpecies properties as they're no longer needed
    delete item.resultLevel;
    delete item.resultSpecies;
  }
  
  // Step 4: Spend remaining points on upgrades
  while (remainingPoints > 0) {
    const availableUpgrades = getAvailableUpgrades(item, remainingPoints, selectedPower);
    
    // Break if no more upgrades possible
    if (availableUpgrades.length === 0) break;
    
    // Pick a random upgrade
    const selectedUpgrade = pickOne(availableUpgrades);
    
    // Apply the upgrade and reduce remaining points
    remainingPoints = applyUpgrade(item, selectedUpgrade, remainingPoints);
  }
  
  // Update the name to match the final target mode
  item.name = generateItemName(selectedPower, item.target);
  
  return item;
}

/**
 * Get available upgrades for an item based on remaining points and power type
 */
function getAvailableUpgrades(item: Item, remainingPoints: number, powerType: ItemPowerId): string[] {
  const availableUpgrades: string[] = [];
  const power = powerFactory.getPower(powerType);
  
  if (!power) return [];
  
  // Add uses (+1 point for +2 uses)
  if (remainingPoints >= 1) {
    availableUpgrades.push('uses');
  }
  
  // Remove target restriction (+1 point)
  if (item.targetFilters?.species || item.targetFilters?.flags) {
    availableUpgrades.push('target_restriction');
  }
  
  // Remove result restriction (+1 point)
  if (item.result && item.result !== 'pick') {
    availableUpgrades.push('result_restriction');
  }
  
  // Target mode upgrade path: random -> pick -> random_type -> pick_type (+1 point each)
  if (item.target === 'random' && remainingPoints >= 1) {
    availableUpgrades.push('upgrade_to_pick');
  } else if (item.target === 'pick' && remainingPoints >= 1 && power.supportsTypeTargeting) {
    availableUpgrades.push('upgrade_to_random_type');
  } else if (item.target === 'random_type' && remainingPoints >= 1) {
    availableUpgrades.push('upgrade_to_pick_type');
  }
  
  // Increase monster level targeting
  const currentLevels = item.targetFilters?.levels || [];
  if (!currentLevels.includes('elite') && !power.levelRestrictions) {
    availableUpgrades.push('level_elite');
  }
  if (!currentLevels.includes('boss') && currentLevels.includes('elite') && !power.levelRestrictions) {
    availableUpgrades.push('level_boss');
  }
  
  return availableUpgrades;
}

/**
 * Apply the selected upgrade to the item and return remaining points
 */
function applyUpgrade(item: Item, upgrade: string, remainingPoints: number): number {
  switch (upgrade) {
    case 'uses':
      item.uses = (item.uses || 1) + 2;
      return remainingPoints - 1;
      
    case 'target_restriction':
      // Remove species and flag restrictions
      if (item.targetFilters) {
        delete item.targetFilters.species;
        delete item.targetFilters.flags;
      }
      return remainingPoints - 1;
      
    case 'result_restriction':
      // Upgrade to player choice
      item.result = 'pick';
      return remainingPoints - 1;
      
    case 'upgrade_to_pick':
      // Upgrade from random to pick (single target)
      item.target = 'pick';
      return remainingPoints - 1;
      
    case 'upgrade_to_random_type':
      // Upgrade from pick to random_type
      item.target = 'random_type';
      return remainingPoints - 1;
      
    case 'upgrade_to_pick_type':
      // Upgrade from random_type to pick_type
      item.target = 'pick_type';
      return remainingPoints - 1;
      
    case 'level_elite':
      // Add elite monsters to targeting
      if (item.targetFilters) {
        item.targetFilters.levels = [...(item.targetFilters.levels || []), 'elite'];
      }
      return remainingPoints - 1;
      
    case 'level_boss':
      // Add boss monsters to targeting
      if (item.targetFilters) {
        item.targetFilters.levels = [...(item.targetFilters.levels || []), 'boss'];
      }
      return remainingPoints - 1;
      
    default:
      return remainingPoints;
  }
}

/**
 * Generate an item name based on power type and target mode
 */
function generateItemName(power: ItemPowerId, targetMode?: string): string {
  // Base material/quality descriptors
  const materials = [
    "Wooden", "Stone", "Copper", "Bronze", "Iron", "Silver", "Gold", "Crystal", 
    "Jade", "Obsidian", "Steel", "Ebony", "Glass", "Bone", "Ancient"
  ];
  
  // Power-specific item types
  const itemTypes: Record<ItemPowerId, string[]> = {
    kill: ["Dagger", "Sword", "Axe", "Hammer", "Spear", "Staff", "Wand", "Bow", "Arrow"],
    transmute: ["Amulet", "Ring", "Medallion", "Talisman", "Charm", "Jewel", "Orb"],
    spy: ["Eyeglass", "Looking Glass", "Lens", "Scope", "Mirror", "Spyglass", "Crystal Ball"],
    shrink: ["Potion", "Elixir", "Flask", "Vial", "Phial", "Draught", "Brew"],
    split: ["Cleaver", "Scissors", "Shears", "Slicer", "Divider", "Splitter", "Carver"],
    pickpocket: ["Gloves", "Lockpick", "Hook", "Claw", "Hand", "Grasp", "Grip", "Thief's Tool"],
    banish: ["Bell", "Book", "Candle", "Scroll", "Rune", "Sigil", "Seal", "Symbol"],
    freeze: ["Ice Crystal", "Frost Stone", "Cold Gem", "Freezing Orb", "Glacier Shard", "Winter Sphere"]
  };
  
  // Get a random material and item type
  const material = pickOne(materials);
  const itemType = pickOne(itemTypes[power] || ["Artifact"]);
  
  // Add a quality term based on the power's level
  const qualityTerm = getLevelQualityTerm(1); // Use level 1 quality term
  
  // Combine parts into full name
  const baseName = `${material} ${qualityTerm} ${itemType}`;
  
  // Add target mode suffix if applicable
  if (targetMode === 'pick') {
    return `${baseName} of Precision`;
  } else if (targetMode === 'random_type') {
    return `${baseName} of Species`;
  } else if (targetMode === 'pick_type') {
    return `${baseName} of Selective Species`;
  }
  
  return baseName;
}

/**
 * Generate a set of test items, one for each power
 */
export function generateTestItems(): Item[] {
  const items: Item[] = [];
  
  // Generate one item for each power type
  const powers: ItemPowerId[] = ['kill', 'transmute', 'spy', 'shrink', 'split', 'pickpocket', 'banish', 'freeze'];
  
  powers.forEach(power => {
    items.push(generateItemWithPower(power, 3));
  });
  
  return items;
}

/**
 * Generate an item with a specific power
 */
function generateItemWithPower(power: ItemPowerId, level: number): Item {
  const powerInstance = powerFactory.getPower(power);
  if (!powerInstance) {
    // Fallback to simple item if power not found
    return {
      id: toItemId(`test_${power}_${Date.now()}`),
      name: `Test ${power} Item`,
      uses: 3,
      power,
      level,
      target: 'random',
      targetFilters: { levels: ['minion', 'grunt'] }
    };
  }
  
  return {
    id: toItemId(`test_${power}_${Date.now()}`),
    name: generateItemName(power, powerInstance.defaultTargetMode),
    uses: 3,
    power,
    level,
    target: powerInstance.defaultTargetMode,
    targetFilters: {
      levels: powerInstance.levelRestrictions || ['minion', 'grunt']
    }
  };
}

/**
 * Log item details for debugging
 */
export function logItemDetails(item: Item): void {
  console.log('Item Details:');
  console.log(`Name: ${item.name}`);
  console.log(`Power: ${item.power}`);
  console.log(`Level: ${item.level}`);
  console.log(`Uses: ${item.uses}`);
  console.log(`Target Mode: ${item.target}`);
  console.log(`Target Filters: ${JSON.stringify(item.targetFilters, null, 2)}`);
  console.log(`Result Mode: ${item.result}`);
  console.log(`Result Level: ${item.resultLevel}`);
  console.log(`Result Species: ${item.resultSpecies}`);
} 
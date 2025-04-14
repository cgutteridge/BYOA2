import type { Item, ItemPower, TargetMode } from '../types/item';
import type { MonsterLevel, Species, MonsterFlag } from '../types';
import { generateEffectDescription, getLevelQualityTerm } from './generateEffectDescription';

// Base point costs for different power types
const POWER_BASE_COSTS: Record<ItemPower, number> = {
  kill: 2,
  transmute: 1,
  scout_500: 1,
  scout_1000: 2,
  scout_any: 3,
  shrink: 2,
  split: 1,
  pickpocket: 2,
  banish: 1
};

// Which powers can have target restrictions
const CAN_HAVE_TARGET_RESTRICTION: Record<ItemPower, boolean> = {
  kill: true,
  transmute: true,
  scout_500: false,
  scout_1000: false,
  scout_any: false,
  shrink: true,
  split: true,
  pickpocket: true,
  banish: true
};

// Which powers support type targeting
const SUPPORTS_TYPE_TARGETING: Record<ItemPower, boolean> = {
  kill: true,
  transmute: true,
  scout_500: false,
  scout_1000: false,
  scout_any: false,
  shrink: true,
  split: true,
  pickpocket: true,
  banish: true
};

// Default target modes for each power
const DEFAULT_TARGET_MODE: Record<ItemPower, TargetMode> = {
  kill: 'random',
  transmute: 'random',
  scout_500: undefined,
  scout_1000: undefined,
  scout_any: undefined,
  shrink: 'random',
  split: 'random',
  pickpocket: 'random',
  banish: 'random'
};

// Which powers can have result restrictions
const CAN_HAVE_RESULT_RESTRICTION: Record<ItemPower, boolean> = {
  kill: false,
  transmute: true,
  scout_500: false,
  scout_1000: false,
  scout_any: false,
  shrink: false,
  split: false,
  pickpocket: false,
  banish: false
};

// Which powers are restricted to certain monster levels
type LevelRestriction = MonsterLevel[] | null;
const LEVEL_RESTRICTIONS: Record<ItemPower, LevelRestriction> = {
  kill: null, // No special restrictions
  transmute: null,
  scout_500: null,
  scout_1000: null,
  scout_any: null,
  shrink: ['elite', 'boss'], // Shrink only works on elite and boss
  split: ['grunt'], // Split only works on grunts
  pickpocket: null,
  banish: null
};

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
  // Convert level 1-6 to points
  const totalPoints = levelToPoints(level);
  
  // Track points spent
  let remainingPoints = totalPoints;
  
  // Step 1: Pick a random power type that fits within our budget
  const availablePowers = Object.entries(POWER_BASE_COSTS)
    .filter(([_, cost]) => cost <= remainingPoints)
    .map(([power]) => power as ItemPower);
    
  if (availablePowers.length === 0) {
    // Fallback to most basic power if no powers fit
    availablePowers.push('kill');
  }
  
  const selectedPower = randomChoice(availablePowers);
  remainingPoints -= POWER_BASE_COSTS[selectedPower];
  
  // Get default target mode
  const defaultTargetMode = DEFAULT_TARGET_MODE[selectedPower] as TargetMode;
  
  // Initialize item with default properties
  const item: Item = {
    id: `random_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: generateItemName(selectedPower, defaultTargetMode),
    description: generateItemDescription(selectedPower, defaultTargetMode),
    uses: 1,
    power: selectedPower,
    level: level,
    target: defaultTargetMode,
    targetFilters: {
      levels: ['minion', 'grunt'] as MonsterLevel[],
    }
  };
  
  // Apply level-specific restrictions if any
  if (LEVEL_RESTRICTIONS[selectedPower]) {
    item.targetFilters = {
      ...item.targetFilters,
      levels: LEVEL_RESTRICTIONS[selectedPower] as MonsterLevel[]
    };
  }
  
  // Step 2: Apply target restrictions if applicable
  if (CAN_HAVE_TARGET_RESTRICTION[selectedPower] && item.targetFilters) {
    // By default, add a species restriction (50%) or flag restriction (50%)
    if (Math.random() < 0.5) {
      item.targetFilters.species = [randomChoice(AVAILABLE_SPECIES)];
    } else {
      item.targetFilters.flags = [randomChoice(AVAILABLE_FLAGS)];
    }
  }
  
  // Step 3: Apply result restrictions if applicable
  if (CAN_HAVE_RESULT_RESTRICTION[selectedPower]) {
    // Default to a restricted result
    item.result = 'random';
    
    // Remove resultLevel and resultSpecies properties as they're no longer needed
    delete item.resultLevel;
    delete item.resultSpecies;
  }
  
  // Step 4: Spend remaining points on upgrades
  while (remainingPoints > 0) {
    const availableUpgrades = [];
    
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
    } else if (item.target === 'pick' && remainingPoints >= 1 && SUPPORTS_TYPE_TARGETING[selectedPower]) {
      availableUpgrades.push('upgrade_to_random_type');
    } else if (item.target === 'random_type' && remainingPoints >= 1) {
      availableUpgrades.push('upgrade_to_pick_type');
    }
    
    // Increase monster level targeting
    const currentLevels = item.targetFilters?.levels || [];
    if (!currentLevels.includes('elite') && !LEVEL_RESTRICTIONS[selectedPower]) {
      availableUpgrades.push('level_elite');
    }
    if (!currentLevels.includes('boss') && currentLevels.includes('elite') && !LEVEL_RESTRICTIONS[selectedPower]) {
      availableUpgrades.push('level_boss');
    }
    
    // Break if no more upgrades possible
    if (availableUpgrades.length === 0) break;
    
    // Pick a random upgrade
    const selectedUpgrade = randomChoice(availableUpgrades);
    
    // Apply the upgrade
    switch (selectedUpgrade) {
      case 'uses':
        item.uses = (item.uses || 1) + 2;
        remainingPoints -= 1;
        break;
        
      case 'target_restriction':
        // Remove species and flag restrictions
        if (item.targetFilters) {
          delete item.targetFilters.species;
          delete item.targetFilters.flags;
        }
        remainingPoints -= 1;
        break;
        
      case 'result_restriction':
        // Upgrade to player choice
        item.result = 'pick';
        remainingPoints -= 1;
        break;
        
      case 'upgrade_to_pick':
        // Upgrade from random to pick (single target)
        item.target = 'pick';
        remainingPoints -= 1;
        break;
        
      case 'upgrade_to_random_type':
        // Upgrade from pick to random_type
        item.target = 'random_type';
        remainingPoints -= 1;
        break;
        
      case 'upgrade_to_pick_type':
        // Upgrade from random_type to pick_type
        item.target = 'pick_type';
        remainingPoints -= 1;
        break;
        
      case 'level_elite':
        // Add elite to targetable levels
        if (item.targetFilters) {
          item.targetFilters.levels = [...currentLevels, 'elite'];
        }
        remainingPoints -= 1;
        break;
        
      case 'level_boss':
        // Add boss to targetable levels
        if (item.targetFilters) {
          item.targetFilters.levels = [...currentLevels, 'boss'];
        }
        remainingPoints -= 1;
        break;
    }
  }
  
  // Update the name to match the final target mode
  item.name = generateItemName(selectedPower, item.target);
  
  // Generate the item description
  item.description = generateItemDescription(selectedPower, item.target);
  
  // Generate the effect description
  item.effectDescription = generateEffectDescription(item);
  
  return item;
}

/**
 * Convert level (1-6) to points for item generation
 */
function levelToPoints(level: number): number {
  switch (level) {
    case 1: return 1;
    case 2: return 2;
    case 3: return 4;
    case 4: return 6;
    case 5: return 8;
    case 6: return 10;
    default: return Math.max(1, Math.min(10, level)); // Clamp between 1-10
  }
}

/**
 * Pick a random item from an array
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random name for the item based on its power and target mode
 */
function generateItemName(power: ItemPower, targetMode?: string): string {
  const prefixes = [
    'Ancient', 'Mystical', 'Enchanted', 'Arcane', 'Magical',
    'Cursed', 'Blessed', 'Sacred', 'Demonic', 'Celestial',
    'Glowing', 'Whispering', 'Enigmatic', 'Shifting', 'Radiant'
  ];
  
  // Base item names
  const baseNames: Record<ItemPower, string[]> = {
    kill: ['Dagger', 'Blade', 'Sword', 'Wand', 'Staff', 'Orb of Destruction'],
    transmute: ['Transmutation Wand', 'Alchemist\'s Stone', 'Morphing Crystal', 'Shifter Orb'],
    scout_500: ['Far-seeing Glass', 'Scout\'s Compass', 'Seeker Stone', 'Tracker\'s Map'],
    scout_1000: ['Enhanced Scout Lens', 'Surveyor\'s Compass', 'Explorer\'s Map', 'Pathfinder Orb'],
    scout_any: ['All-seeing Eye', 'Omniscient Orb', 'Cosmic Map', 'Planar Compass'],
    shrink: ['Miniaturizing Ray', 'Reduction Powder', 'Shrinking Solution', 'Diminution Wand'],
    split: ['Splitter\'s Dagger', 'Division Wand', 'Duplicator\'s Rod', 'Replicator Stone'],
    pickpocket: ['Thief\'s Gloves', 'Shadow Hand', 'Pilferer\'s Tool', 'Sticky Fingers Charm'],
    banish: ['Banishment Scroll', 'Ethereal Disruptor', 'Void Talisman', 'Dimensional Shifter']
  };
  
  // Mode modifiers
  const modeModifiers: Record<string, string[]> = {
    random: ['Focused', 'Precise', 'Single-Target', 'Selective'],
    pick: ['Discerning', 'Chooser\'s', 'Hunter\'s', 'Selective'],
    random_type: ['Type-Seeking', 'Kind-Hunting', 'Variant-Tracking', 'Species-Wide'],
    pick_type: ['Type-Choosing', 'Group-Targeting', 'Master', 'Family-Hunting']
  };
  
  const prefix = randomChoice(prefixes);
  const baseName = randomChoice(baseNames[power]);
  
  // Add mode modifier if this is a type targeting or pick mode
  if (targetMode && targetMode !== 'random' && SUPPORTS_TYPE_TARGETING[power]) {
    const modeModifier = randomChoice(modeModifiers[targetMode]);
    return `${prefix} ${modeModifier} ${baseName}`;
  }
  
  return `${prefix} ${baseName}`;
}

/**
 * Generate a description for an item based on its power
 */
function generateItemDescription(power: ItemPower, targetMode?: TargetMode): string {
  switch (power) {
    case 'kill':
      if (targetMode === 'random_type' || targetMode === 'pick_type') {
        return 'Instantly defeats all monsters of the same type in the current location.';
      }
      return 'Instantly defeats a monster in the current location.';
    case 'transmute':
      if (targetMode === 'random_type' || targetMode === 'pick_type') {
        return 'Transforms all monsters of the same type in the current location.';
      }
      return 'Transforms a monster in the current location.';
    case 'shrink':
      if (targetMode === 'random_type' || targetMode === 'pick_type') {
        return 'Reduces all powerful monsters of the same type to a weaker form.';
      }
      return 'Reduces a powerful monster to a weaker form.';
    case 'split':
      if (targetMode === 'random_type' || targetMode === 'pick_type') {
        return 'Splits all grunt monsters of the same type into weaker minions.';
      }
      return 'Splits a grunt monster into weaker minions.';
    case 'pickpocket':
      if (targetMode === 'random_type' || targetMode === 'pick_type') {
        return 'Steals items from all monsters of the same type without engaging in combat.';
      }
      return 'Steals an item from a monster without engaging in combat.';
    case 'banish':
      return 'Immediately removes a monster from the location without yielding any loot.';
    default:
      return 'Instantly defeats a single target monster.';
  }
}

/**
 * Generate test items for each level (1-6)
 * For debugging and testing purposes
 */
export function generateTestItems(): Item[] {
  const items: Item[] = [];
  
  for (let level = 1; level <= 6; level++) {
    // Generate 3 items for each level
    for (let i = 0; i < 3; i++) {
      items.push(generateRandomItem(level));
    }
  }
  
  return items;
}

/**
 * Log details about a generated item
 * For debugging purposes
 */
export function logItemDetails(item: Item): void {
  console.log(`==== Item: ${item.name} ====`);
  console.log(`Quality: ${getLevelQualityTerm(item.level)} (Level ${item.level})`);
  console.log(`Power: ${item.power}`);
  console.log(`Uses: ${item.uses || 1}`);
  console.log(`Description: ${item.description}`);
  console.log(`Effect: ${item.effectDescription || 'None'}`);
  console.log(`Target mode: ${item.target || 'none'}`);
  
  if (item.targetFilters) {
    if (item.targetFilters.levels) {
      console.log(`Target levels: ${item.targetFilters.levels.join(', ')}`);
    }
    if (item.targetFilters.species) {
      console.log(`Target species: ${item.targetFilters.species.join(', ')}`);
    }
    if (item.targetFilters.flags) {
      console.log(`Target flags: ${item.targetFilters.flags.join(', ')}`);
    }
  }
  
  if (item.result) {
    console.log(`Result mode: ${item.result}`);
    if (item.resultLevel) {
      console.log(`Result level: ${item.resultLevel}`);
    }
    if (item.resultSpecies) {
      console.log(`Result species: ${item.resultSpecies}`);
    }
  }
  
  console.log('============================');
} 
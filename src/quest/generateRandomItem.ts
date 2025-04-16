import type { Item, TargetMode } from '../types/item.ts';
import type { MonsterLevel, Species, MonsterFlag, ItemPowerId } from '../types';
import { toItemId } from '../types';
import { generateEffectDescription, getLevelQualityTerm } from './generateEffectDescription.ts';
import pickOne from "@/utils/pickOne.ts";

// Base point costs for different power types
const POWER_BASE_COSTS: Record<ItemPowerId, number> = {
  kill: 2,
  transmute: 1,
  spy: 2,  // Base cost for spying
  shrink: 2,
  split: 1,
  pickpocket: 2,
  banish: 1,
  freeze: 2
};

// Which powers can have target restrictions
const CAN_HAVE_TARGET_RESTRICTION: Record<ItemPowerId, boolean> = {
  kill: true,
  transmute: true,
  spy: false,
  shrink: true,
  split: true,
  pickpocket: true,
  banish: true,
  freeze: true
};

// Which powers support type targeting
const SUPPORTS_TYPE_TARGETING: Record<ItemPowerId, boolean> = {
  kill: true,
  transmute: true,
  spy: false,
  shrink: true,
  split: true,
  pickpocket: true,
  banish: true,
  freeze: true
};

// Default target modes for each power
const DEFAULT_TARGET_MODE: Record<ItemPowerId, TargetMode> = {
  kill: 'random',
  transmute: 'random',
  spy: undefined,
  shrink: 'random',
  split: 'random',
  pickpocket: 'random',
  banish: 'random',
  freeze: 'random'
};

// Which powers can have result restrictions
const CAN_HAVE_RESULT_RESTRICTION: Record<ItemPowerId, boolean> = {
  kill: false,
  transmute: true,
  spy: false,
  shrink: false,
  split: false,
  pickpocket: false,
  banish: false,
  freeze: false
};

// Which powers are restricted to certain monster levels
type LevelRestriction = MonsterLevel[] | null;
const LEVEL_RESTRICTIONS: Record<ItemPowerId, LevelRestriction> = {
  kill: null, // No special restrictions
  transmute: null,
  spy: null,
  shrink: ['elite', 'boss'], // Shrink only works on elite and boss
  split: ['grunt'], // Split only works on grunts
  pickpocket: null,
  banish: null,
  freeze: null
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
  // Use level directly as points
  const totalPoints = level;
  
  // Track points spent
  let remainingPoints = totalPoints;
  
  // Step 1: Pick a random power type that fits within our budget
  const availablePowers = Object.entries(POWER_BASE_COSTS)
    .filter(([_, cost]) => cost <= remainingPoints)
    .map(([power]) => power as ItemPowerId);
    
  if (availablePowers.length === 0) {
    // Fallback to most basic power if no powers fit
    availablePowers.push('kill');
  }
  
  const selectedPower = pickOne(availablePowers);
  remainingPoints -= POWER_BASE_COSTS[selectedPower];
  
  // Get default target mode
  const defaultTargetMode = DEFAULT_TARGET_MODE[selectedPower] as TargetMode;
  
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
      item.targetFilters.species = [pickOne(AVAILABLE_SPECIES)];
    } else {
      item.targetFilters.flags = [pickOne(AVAILABLE_FLAGS)];
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
  } else if (item.target === 'pick' && remainingPoints >= 1 && SUPPORTS_TYPE_TARGETING[powerType]) {
    availableUpgrades.push('upgrade_to_random_type');
  } else if (item.target === 'random_type' && remainingPoints >= 1) {
    availableUpgrades.push('upgrade_to_pick_type');
  }
  
  // Increase monster level targeting
  const currentLevels = item.targetFilters?.levels || [];
  if (!currentLevels.includes('elite') && !LEVEL_RESTRICTIONS[powerType]) {
    availableUpgrades.push('level_elite');
  }
  if (!currentLevels.includes('boss') && currentLevels.includes('elite') && !LEVEL_RESTRICTIONS[powerType]) {
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
      // Add elite to targetable levels
      if (item.targetFilters) {
        const currentLevels = item.targetFilters.levels || [];
        item.targetFilters.levels = [...currentLevels, 'elite'];
      }
      return remainingPoints - 1;
      
    case 'level_boss':
      // Add boss to targetable levels
      if (item.targetFilters) {
        const currentLevels = item.targetFilters.levels || [];
        item.targetFilters.levels = [...currentLevels, 'boss'];
      }
      return remainingPoints - 1;
      
    default:
      return remainingPoints;
  }
}

/**
 * Generate a random name for the item based on its power and target mode
 */
function generateItemName(power: ItemPowerId, targetMode?: string): string {
  const prefixes = [
    'Ancient', 'Mystical', 'Enchanted', 'Arcane', 'Magical',
    'Cursed', 'Blessed', 'Sacred', 'Demonic', 'Celestial',
    'Glowing', 'Whispering', 'Enigmatic', 'Shifting', 'Radiant'
  ];
  
  // Base item names
  const baseNames: Record<ItemPowerId, string[]> = {
    kill: ['Dagger', 'Blade', 'Sword', 'Wand', 'Staff', 'Orb of Destruction'],
    transmute: ['Transmutation Wand', 'Alchemist\'s Stone', 'Morphing Crystal', 'Shifter Orb'],
    spy: ['Far-seeing Glass', 'Spyglass Telescope', 'Winged Monkey', 'Scrying Orb', 'Crystal Ball', 'Astral Eye'],
    shrink: ['Miniaturizing Ray', 'Reduction Powder', 'Shrinking Solution', 'Diminution Wand'],
    split: ['Splitter\'s Dagger', 'Division Wand', 'Duplicator\'s Rod', 'Replicator Stone'],
    pickpocket: ['Thief\'s Gloves', 'Shadow Hand', 'Pilferer\'s Tool', 'Sticky Fingers Charm'],
    banish: ['Banishment Scroll', 'Ethereal Disruptor', 'Void Talisman', 'Dimensional Shifter'],
    freeze: ['Freezing Ray', 'Ice Crystal', 'Frost Orb', 'Cryogenic Wand']
  };
  
  // Mode modifiers
  const modeModifiers: Record<string, string[]> = {
    random: ['Focused', 'Precise', 'Single-Target', 'Selective'],
    pick: ['Discerning', 'Chooser\'s', 'Hunter\'s', 'Selective'],
    random_type: ['Type-Seeking', 'Kind-Hunting', 'Variant-Tracking', 'Species-Wide'],
    pick_type: ['Type-Choosing', 'Group-Targeting', 'Master', 'Family-Hunting']
  };
  
  const prefix = pickOne(prefixes);
  const baseName = pickOne(baseNames[power]);
  
  // Add mode modifier if this is a type targeting or pick mode
  if (targetMode && targetMode !== 'random' && SUPPORTS_TYPE_TARGETING[power]) {
    const modeModifier = pickOne(modeModifiers[targetMode]);
    return `${prefix} ${modeModifier} ${baseName}`;
  }
  
  return `${prefix} ${baseName}`;
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
  console.log(`Effect: ${generateEffectDescription(item)}`);
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
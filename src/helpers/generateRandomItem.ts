import type { Item, ItemPower, TargetScope } from '../types/item';
import type { MonsterLevel, Species, MonsterFlag } from '../types';

// Base point costs for different power types
const POWER_BASE_COSTS: Record<ItemPower, number> = {
  kill: 1,
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

// Which powers support target scope upgrades
const SUPPORTS_TARGET_SCOPE: Record<ItemPower, boolean> = {
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

// Default target scope for each power
const DEFAULT_TARGET_SCOPE: Record<ItemPower, TargetScope> = {
  kill: 'one',
  transmute: 'one',
  scout_500: undefined,
  scout_1000: undefined,
  scout_any: undefined,
  shrink: 'one',
  split: 'one',
  pickpocket: 'one',
  banish: 'one'
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
 * Convert item level to descriptive quality term
 */
function getLevelQualityTerm(level: number): string {
  switch (level) {
    case 1: return "crap";
    case 2: return "mediocre";
    case 3: return "decent";
    case 4: return "superior";
    case 5: return "excellent";
    case 6: return "legendary";
    default: return "unknown quality";
  }
}

/**
 * Generate a clear effect description for the item
 */
function generateEffectDescription(item: Item): string {
  if (!item.power) return "Does nothing special.";
  
  const qualityTerm = getLevelQualityTerm(item.level);
  let effect = "";
  
  // Base effect by power type
  switch (item.power) {
    case 'kill':
      effect = `This ${qualityTerm} item instantly defeats`;
      break;
    case 'transmute':
      effect = `This ${qualityTerm} item transforms`;
      break;
    case 'shrink':
      effect = `This ${qualityTerm} item reduces the power of`;
      break;
    case 'split':
      effect = `This ${qualityTerm} item splits`;
      break;
    case 'pickpocket':
      effect = `This ${qualityTerm} item steals from`;
      break;
    case 'banish':
      effect = `This ${qualityTerm} item banishes`;
      break;
    case 'scout_500':
      effect = `This ${qualityTerm} item reveals any location within 500 meters`;
      break;
    case 'scout_1000':
      effect = `This ${qualityTerm} item reveals any location within 1000 meters`;
      break;
    case 'scout_any':
      effect = `This ${qualityTerm} item reveals any location`;
      break;
    default:
      effect = `This ${qualityTerm} item has unknown effects`;
  }
  
  // For scout powers, add a period and skip target scope processing
  if (item.power?.startsWith('scout_')) {
    effect += ".";
  } else {
    // Add targeting scope
    if (item.targetScope) {
      switch (item.targetScope) {
        case 'one':
          effect += " a single monster";
          break;
        case 'type':
          effect += " all monsters of the same type in the current location";
          break;
      }
    } else {
      effect += " a single monster";
    }
    
    // Add target filters if present
    if (item.targetFilters) {
      const filters = [];
      
      if (item.targetFilters.levels && item.targetFilters.levels.length > 0) {
        filters.push(`${item.targetFilters.levels.join('/')} level`);
      }
      
      if (item.targetFilters.species && item.targetFilters.species.length > 0) {
        filters.push(`${item.targetFilters.species.join('/')} species`);
      }
      
      if (item.targetFilters.flags && item.targetFilters.flags.length > 0) {
        filters.push(`${item.targetFilters.flags.join('/')} type`);
      }
      
      if (filters.length > 0) {
        effect += ` (works on ${filters.join(', ')})`;
      }
    }
    
    // Add result restrictions for transmute items
    if (item.power === 'transmute') {
      effect += ".";
      
      // Add information about what the monster transforms into
      if (item.result) {
        switch (item.result) {
          case 'random':
            effect += " Transforms target into a random monster.";
            break;
          case 'pick':
            effect += " User chooses what monster to transform target into.";
            break;
          case 'level':
            if (item.resultLevel) {
              effect += ` Transforms target into a ${item.resultLevel} monster of the same species.`;
            }
            break;
          case 'species':
            if (item.resultSpecies) {
              effect += ` Transforms target into a ${item.resultSpecies} monster of the same level.`;
            }
            break;
        }
      }
    } else {
      effect += ".";
    }
  }
  
  // Add number of uses
  effect += ` Has ${item.uses || 1} ${(item.uses === 1 || !item.uses) ? 'use' : 'uses'} remaining.`;
  
  return effect;
}

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
  
  // Set default target scope
  const targetScope = DEFAULT_TARGET_SCOPE[selectedPower];
  
  // Initialize item with default properties
  const item: Item = {
    id: `random_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: generateItemName(selectedPower, targetScope),
    description: generateItemDescription(selectedPower),
    uses: 1,
    power: selectedPower,
    level: level,
    target: 'random',
    targetScope: targetScope,
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
    
    // 50% chance to restrict by level, 50% by species
    if (Math.random() < 0.5) {
      item.result = 'level';
      item.resultLevel = randomChoice(['minion', 'grunt', 'elite'] as MonsterLevel[]);
    } else {
      item.result = 'species';
      item.resultSpecies = randomChoice(AVAILABLE_SPECIES);
    }
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
    
    // Upgrade target mode from random to pick (+1 point)
    if (item.target === 'random') {
      availableUpgrades.push('target_mode');
    }
    
    // Upgrade target scope (type/race/all) if supported by this power (+1 point per level)
    if (SUPPORTS_TARGET_SCOPE[selectedPower] && item.targetScope) {
      // Points cost: one -> type = 1 point
      if (item.targetScope === 'one' && remainingPoints >= 1) {
        availableUpgrades.push('scope_type');
      }
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
        
      case 'target_mode':
        // Upgrade to player choice
        item.target = 'pick';
        remainingPoints -= 1;
        break;
        
      case 'scope_type':
        // Upgrade from one to type
        item.targetScope = 'type';
        remainingPoints -= 1;
        break;
        
      case 'scope_race':
        // No longer supported
        break;
        
      case 'scope_all':
        // No longer supported
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
  
  // After upgrades, update the name to match the final scope
  if (item.targetScope !== targetScope) {
    item.name = generateItemName(selectedPower, item.targetScope);
  }
  
  // Adjust the item description based on its final scope
  item.description = generateFinalDescription(item);
  
  // Generate the effect description
  item.effectDescription = generateEffectDescription(item);
  
  return item;
}

/**
 * Generate a final description based on item's power and target scope
 */
function generateFinalDescription(item: Item): string {
  if (!item.power) return item.description;

  const baseDescription = generateItemDescription(item.power);
  
  // For scout powers, no need to adjust
  if (item.power.startsWith('scout_')) {
    return baseDescription;
  }
  
  // Adjust description based on target scope for powers that can target different scopes
  if (item.targetScope) {
    switch (item.targetScope) {
      case 'one':
        return baseDescription; // Default is already targeting one
        
      case 'type':
        if (item.power === 'kill') {
          return 'Instantly defeats all monsters of the same type in the current location.';
        } else if (item.power === 'transmute') {
          return 'Transforms all monsters of the same type in the current location.';
        } else if (item.power === 'shrink') {
          return 'Reduces all powerful monsters of the same type to a weaker form.';
        } else if (item.power === 'split') {
          return 'Splits all grunt monsters of the same type into weaker minions.';
        } else if (item.power === 'pickpocket') {
          return 'Steals items from all monsters of the same type without engaging in combat.';
        }
        break;
    }
  }
  
  return baseDescription;
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
 * Generate a random name for the item based on its power and scope
 */
function generateItemName(power: ItemPower, targetScope?: TargetScope): string {
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
  
  // Scope modifiers
  const scopeModifiers: Record<string, string[]> = {
    one: ['Focused', 'Precise', 'Single-Target', 'Selective'],
    type: ['Type-Seeking', 'Kind-Hunting', 'Variant-Tracking', 'Species-Wide']
  };
  
  const prefix = randomChoice(prefixes);
  const baseName = randomChoice(baseNames[power]);
  
  // Add scope modifier for powers that can have different scopes
  if (targetScope && SUPPORTS_TARGET_SCOPE[power] && targetScope !== 'one') {
    const scopeModifier = randomChoice(scopeModifiers[targetScope]);
    return `${prefix} ${scopeModifier} ${baseName}`;
  }
  
  return `${prefix} ${baseName}`;
}

/**
 * Generate a brief description of the item's power
 */
function generateItemDescription(power: ItemPower): string {
  const descriptions: Record<ItemPower, string> = {
    kill: 'Instantly defeats a single target monster.',
    transmute: 'Transforms a single target monster into another type.',
    scout_500: 'Reveals pubs within 500 meters.',
    scout_1000: 'Reveals pubs within 1000 meters.',
    scout_any: 'Reveals all pubs in the area.',
    shrink: 'Reduces a single powerful monster to a weaker form.',
    split: 'Splits a single grunt monster into two weaker minions.',
    pickpocket: 'Steals an item from a single target monster without engaging in combat.',
    banish: 'Immediately removes a monster from the location without yielding any loot.'
  };
  
  return descriptions[power];
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
  console.log(`Target scope: ${item.targetScope || 'none'}`);
  
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
import type { Item } from '../types/item'
import type { Monster, Pub, MonsterTypeId, ItemPowerId } from '../types'
import type { PowerResult } from './types'
import { ItemPower } from './types'
import { BanishPower } from './banish'
import { KillPower } from './kill'
import { SpyPower } from './spy'
import { ShrinkPower } from './shrink'
import { SplitPower } from './split'
import { TransmutePower } from './transmute'
import { PickpocketPower } from './pickpocket'
import { FreezePower } from './freeze'

// Create instances of the power classes
const banishPower = new BanishPower();
const killPower = new KillPower();
const spyPower = new SpyPower();
const transmutePower = new TransmutePower();
const shrinkPower = new ShrinkPower();
const splitPower = new SplitPower();
const pickpocketPower = new PickpocketPower();
const freezePower = new FreezePower();

// Register all power implementations
const powerInstances: Record<ItemPowerId, ItemPower> = {
  banish: banishPower,
  kill: killPower,
  spy: spyPower,
  transmute: transmutePower,
  shrink: shrinkPower,
  split: splitPower,
  pickpocket: pickpocketPower,
  freeze: freezePower
};

// Default power UI properties
const defaultPowerProperties = {
  icon: '?',
  glowColor: 'rgba(255, 255, 255, 0.8)',
  displayName: 'Unknown'
}

/**
 * Power factory implementation
 */
export const powerFactory = {
  getPower: (powerName: ItemPowerId): ItemPower | undefined => {
    return powerInstances[powerName];
  },
  
  getIcon: (powerName: ItemPowerId): string => {
    const power = powerInstances[powerName];
    return power?.icon || defaultPowerProperties.icon;
  },
  
  getGlowColor: (powerName: ItemPowerId): string => {
    const power = powerInstances[powerName];
    return power?.glowColor || defaultPowerProperties.glowColor;
  },
  
  getDisplayName: (powerName: ItemPowerId): string => {
    const power = powerInstances[powerName];
    return power?.displayName || powerName || defaultPowerProperties.displayName;
  }
}

/**
 * Execute a power with the given item and target
 */
export function executePower(
  item: Item, 
  target?: Monster | Pub | string | any
): PowerResult {
  // Default result
  const defaultResult: PowerResult = {
    success: false,
    message: `Power ${item.power} not implemented or not available.`
  }
  
  // If no power specified, return failure
  if (!item.power) {
    return {
      ...defaultResult,
      message: 'No power specified for this item.'
    }
  }
  
  // Check if power exists and execute it
  const power = powerInstances[item.power];
  if (power) {
    try {
      // Determine type of target and apply appropriate method
      if (typeof target === 'string') {
        // Check if it's a monster ID or type
        if (target.startsWith('monster_')) {
          return power.useOnMonster(item, target);
        } else if (target.startsWith('location_')) {
          return power.applyToLocation(item, target);
        } else {
          return power.useOnType(item, target as MonsterTypeId);
        }
      } else if (target && 'id' in target && 'type' in target && 'alive' in target) {
        // It's a monster object
        return power.useOnMonster(item, target.id);
      } else if (target && 'id' in target && 'monsters' in target) {
        // It's a location/pub object
        return power.applyToLocation(item, target.id);
      }
      
      return {
        success: false,
        message: `Invalid target for ${item.name}.`
      };
    } catch (error) {
      return {
        success: false,
        message: `Error using ${item.name}: ${error}`
      }
    }
  }
  
  // Power not found
  return defaultResult;
}

/**
 * Check if an item can target the specified target
 */
export function canTargetWith(
  item: Item, 
  target?: Monster | Pub | string | any
): boolean {
  if (!item.power) return false;
  
  const power = powerInstances[item.power];
  if (!power) return false;
  
  // Determine type of target
  if (typeof target === 'string') {
    // It's either a monster ID, location ID, or monster type
    return true; // The specific Power class will handle detailed validation
  } else if (target && 'type' in target && 'alive' in target) {
    // It's a monster object
    return target.alive; // Basic check - can only target alive monsters
  } else if (target && 'monsters' in target) {
    // It's a location/pub object
    return true;
  }
  
  return false;
}

/**
 * Get valid targets for an item in the current monsters array
 */
export function getValidTargets(
  item: Item,
  targets: Monster[] | Pub[] | any[]
): Monster[] | Pub[] | string[] | any[] {
  if (!item.power) return [];
  
  const power = powerInstances[item.power];
  if (power) {
    // Determine what type of targets we're dealing with
    if (targets.length > 0) {
      if ('type' in targets[0] && 'alive' in targets[0]) {
        // It's a monster array
        return power.targetMonsters(item, targets as Monster[]);
      } else if ('monsters' in targets[0]) {
        // It's a locations array
        return power.targetLocations(item, targets as Pub[]);
      }
    }
    
    // Default to empty array if we couldn't determine target type
    return [];
  }
  
  return [];
}

// Export an empty register function to be filled in later stages
export function registerPowers() {
  // This will register all power functions in later stages
} 
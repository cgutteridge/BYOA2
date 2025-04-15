import type { Item } from '../types/item'
import type { Monster, Pub } from '../types'
import type { PowerFunction, PowerResult, PowerFactory } from './types'
import { banish } from './banish'
import { killOne, killAll } from './kill'
import { spy } from './spy'

// Register all power implementations
const powerFunctions: Record<string, PowerFunction> = {
  banish,
  kill: killOne,  // Map 'kill' power to killOne implementation
  killAll,
  spy
  // Other power implementations will be added here
}

// Default power UI properties
const defaultPowerProperties = {
  icon: '?',
  glowColor: 'rgba(255, 255, 255, 0.8)',
  displayName: 'Unknown'
}

/**
 * Power factory implementation
 */
export const powerFactory: PowerFactory = {
  getPowerFunction: (powerName: string): PowerFunction | undefined => {
    return powerFunctions[powerName]
  },
  
  getIcon: (powerName: string): string => {
    const powerFunction = powerFunctions[powerName]
    return powerFunction?.icon || defaultPowerProperties.icon
  },
  
  getGlowColor: (powerName: string): string => {
    const powerFunction = powerFunctions[powerName]
    return powerFunction?.glowColor || defaultPowerProperties.glowColor
  },
  
  getDisplayName: (powerName: string): string => {
    const powerFunction = powerFunctions[powerName]
    return powerFunction?.displayName || powerName || defaultPowerProperties.displayName
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
  const powerFunction = powerFunctions[item.power]
  if (powerFunction) {
    if (powerFunction.canTarget(item, target)) {
      try {
        powerFunction.execute(item, target)
        return {
          success: true,
          message: `Successfully used ${item.name}.`
        }
      } catch (error) {
        return {
          success: false,
          message: `Error using ${item.name}: ${error}`
        }
      }
    } else {
      return {
        success: false,
        message: `Invalid target for ${item.name}.`
      }
    }
  }
  
  // Power not found
  return defaultResult
}

/**
 * Check if an item can target the specified target
 */
export function canTargetWith(
  item: Item, 
  target?: Monster | Pub | string | any
): boolean {
  if (!item.power) return false
  
  const powerFunction = powerFunctions[item.power]
  if (powerFunction) {
    return powerFunction.canTarget(item, target)
  }
  
  return false
}

/**
 * Get valid targets for an item in the current monsters array
 */
export function getValidTargets(
  item: Item,
  targets: Monster[] | Pub[] | any[]
): Monster[] | Pub[] | string[] | any[] {
  if (!item.power) return []
  
  const powerFunction = powerFunctions[item.power]
  if (powerFunction) {
    return powerFunction.getValidTargets(item, targets)
  }
  
  return []
}

// Export an empty register function to be filled in later stages
export function registerPowers() {
  // This will register all power functions in later stages
} 
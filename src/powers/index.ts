import type { Item } from '../types/item'
import type { Monster } from '../types'
import type { PowerFunction, PowerResult } from './types'
import { banish } from './banish'
import { killOne, killAll } from './kill'

// Register all power implementations
const powerFunctions: Record<string, PowerFunction> = {
  banish,
  kill: killOne  // Map 'kill' power to killOne implementation
  // Other power implementations will be added here
}

/**
 * Execute a power with the given item and target
 */
export function executePower(
  item: Item, 
  target?: Monster | string | any
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
  target?: Monster | string | any
): boolean {
  if (!item.power) return false
  
  const powerFunction = powerFunctions[item.power]
  if (powerFunction) {
    return powerFunction.canTarget(item, target)
  }
  
  return false
}

/**
 * Get valid targets for an item
 */
export function getValidTargets(
  item: Item
): Monster[] | string[] | any[] {
  if (!item.power) return []
  
  const powerFunction = powerFunctions[item.power]
  if (powerFunction && powerFunction.getValidTargets) {
    return powerFunction.getValidTargets(item)
  }
  
  return []
}

/**
 * Get a description of what targets an item can affect
 */
export function getTargetDescription(item: Item): string {
  if (!item.power) return 'This item has no power.'
  
  const powerFunction = powerFunctions[item.power]
  if (powerFunction) {
    return powerFunction.getTargetDescription(item)
  }
  
  return 'Unknown targeting capabilities.'
}

// Export an empty register function to be filled in later stages
export function registerPowers() {
  // This will register all power functions in later stages
} 
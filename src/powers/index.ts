import type { EnhancedItem } from '../types/item'
import type { Monster } from '../types'
import type { PowerFunction, PowerResult } from './types'

// This will be populated with power implementations in later stages
const powerFunctions: Record<string, PowerFunction> = {}

/**
 * Execute a power with the given item and target
 */
export function executePower(
  item: EnhancedItem, 
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
  item: EnhancedItem, 
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
  item: EnhancedItem
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
export function getTargetDescription(item: EnhancedItem): string {
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
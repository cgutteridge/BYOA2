import type { Item } from '../types/item'
import type { Monster } from '../types'
import { canTargetMonster, getValidMonsterTargets, getValidMonsterTypes, getTargetsForItem } from './utils'

/**
 * Unified targeting system for all powers
 * 
 * This provides common targeting logic based on item.target mode:
 * - random: Randomly select one valid target
 * - pick: Let the player pick one valid target
 * - random_type: Randomly select one valid monster type
 * - pick_type: Let the player pick one valid monster type
 */

/**
 * Get a human-readable description of an item's targeting mode
 * @param item The item to get targeting info for
 * @returns A string description of how targeting works
 */
export function getTargetingDescription(item: Item): string {
  if (!item.target) {
    return "Targets a random monster"
  }

  switch (item.target) {
    case 'random':
      return "Targets a random monster"
    case 'pick':
      return "Choose a monster to target"
    case 'random_type':
      return "Targets all monsters of a random type"
    case 'pick_type':
      return "Choose a monster type to target"
    case 'location':
      return "Targets the current location"
    default:
      return "Unknown targeting mode"
  }
}

/**
 * Get a human-readable description of an item's result mode
 * @param item The item to get result info for
 * @returns A string description of result mechanics, if any
 */
export function getResultDescription(item: Item): string {
  if (!item.result) {
    return ""
  }

  switch (item.result) {
    case 'random_type':
      return "Creates a random monster type"
    case 'chosen_type':
      return "Creates a chosen monster type"
    default:
      return ""
  }
}

/**
 * Execute a targeting selection based on item's target mode
 * @param item The item being used
 * @param monsters Array of available monsters
 * @param onSelect Callback for when a target is selected
 */
export function executeTargeting(
  item: Item, 
  monsters: Monster[], 
  onSelect: (target: Monster | string) => void
): void {
  // Get valid targets based on item's target mode
  if (!item.target || item.target === 'random') {
    // Random single monster targeting
    const validTargets = getValidMonsterTargets(item, monsters)
    if (validTargets.length > 0) {
      const randomIndex = Math.floor(Math.random() * validTargets.length)
      onSelect(validTargets[randomIndex])
    }
  } 
  else if (item.target === 'random_type') {
    // Random monster type targeting
    const validTypes = getValidMonsterTypes(item, monsters)
    if (validTypes.length > 0) {
      const randomIndex = Math.floor(Math.random() * validTypes.length)
      onSelect(validTypes[randomIndex])
    }
  }
  // For 'pick' and 'pick_type', we don't do anything here
  // as those require user interaction and will be handled by the UI
}

// Re-export getTargetsForItem for backward compatibility
export { getTargetsForItem } 
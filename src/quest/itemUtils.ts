import type {Item, Monster, MonsterTypeId, Pub} from '../types'
import {powerFactory} from '../powers'

/**
 * Get targets for an item based on its targeting mode
 * @param item The item to get targets for
 * @param potentialTargets Array of potential targets (monsters, locations, etc)
 * @returns Array of valid targets
 */
export function getTargetsForItem(item: Item, potentialTargets: Monster[]): Pub[] | MonsterTypeId[] | Monster[] {
  const power = powerFactory.getPower(item.power);
  if (power) {
    return power.getValidTargets(item, potentialTargets);
  }
  return [];
}



// Re-export getTargetsForItem as getValidTargets for backward compatibility
export const getValidTargets = getTargetsForItem;

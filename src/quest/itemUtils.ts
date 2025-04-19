import type {Item, Monster, MonsterTypeId, GameLocation} from '../types'
import {powerFactory} from '../powers'
import {useQuestStore} from '@/stores/questStore'
import {toItemId} from '@/types'

/**
 * Get targets for an item based on its targeting mode
 * @param item The item to get targets for
 * @param potentialTargets Array of potential targets (monsters, locations, etc)
 * @returns Array of valid targets
 */
export function getTargetsForItem(item: Item, potentialTargets: Monster[]): GameLocation[] | MonsterTypeId[] | Monster[] {
  const power = powerFactory.getPower(item.power);
  if (power) {
    return power.getValidTargets(item, potentialTargets);
  }
  return [];
}

/**
 * Generate a token item for a given location
 * @param location The location to generate a token for
 * @returns A token item with 1 use
 */
export function generateTokenItem(location: GameLocation): Item {
  const questStore = useQuestStore()
  const tokenTitle = questStore.tokenTitle
  const tokenDescription = questStore.tokenDescription
  
  return {
    id: toItemId(`token_${location.id}_${Date.now()}`),
    name: `${tokenTitle}`,
    description: `${tokenDescription} from ${location.name}`,
    uses: 1,
    level: 10,
    power: 'token',
    icon: '⭐️',
    timestamp: Date.now()
  }
}

export function generateVictoryItem(location: GameLocation): Item {
  const questStore = useQuestStore()
  const tokenTitle = questStore.title

  return {
    id: toItemId(`victory_${location.id}_${Date.now()}`),
    name: `${tokenTitle}`,
    description: `The item you are questing for.`,
    uses: 1,
    level: 100,
    power: 'victory',
    icon: '🥇',
    timestamp: Date.now()
  }
}



// Re-export getTargetsForItem as getValidTargets for backward compatibility
export const getValidTargets = getTargetsForItem;

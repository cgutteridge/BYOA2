import type {GameLocation, Item, Monster, MonsterType} from '../types'
import {powerFactory} from '../powers'
import {useQuestStore} from '@/stores/questStore'
import {toItemId} from '@/types'
import {getUniqueMonsterTypes} from "@/quest/monsterUtils.ts";
import {useLocationStore} from "@/stores/locationStore.ts";

export function itemCanBeUsed(item: Item) {
  const power = powerFactory.getPower(item.power);

  if (power.itemTargetType === 'none') {
    return false;
  }
  
  if (power.itemTargetType === 'special') {
    // Special items are always possible to use
    return power.canItemBeUsedWithoutTarget(item);
  }
  
  // Check if there are valid targets for this item
  return itemHasValidTargets(item);
}

export function itemHasValidTargets(item: Item) {
  const questStore = useQuestStore()
  const power = powerFactory.getPower(item.power);

  if(power.itemTargetType === 'special') {
    // later might use a power property for getting bespoke answer to this for special powers
    return true
  }
  
  if (power.itemTargetType === 'locations') {
    // For locations, we just check if any potential locations exist
    return potentialTargetLocationsForItem(item).length > 0
  }
  
  if (power.itemTargetType === 'monsters') {
    if (item.target === 'pick' || item.target === 'random') {
      return potentialTargetMonstersForItem(item, questStore.currentGameLocation).length > 0
    } else {
      return potentialTargetMonstersTypesForItem(item, questStore.currentGameLocation).length > 0
    }
  }
  
  return false;
}

export function potentialTargetMonstersTypesForItem(item: Item, location: GameLocation | undefined): MonsterType[] {
  const power = powerFactory.getPower(item.power);
  if (location === undefined) {
    return []
  }
  if (power.itemTargetType !== 'monsters') {
    return [];
  }
  // this item targets individuals not types
  if (item.target !== 'pick_type' && item.target !== 'random_type') {
    return []
  }
  const aliveMonsters = (location.monsters ?? []).filter(monster => monster.alive)
  const allMonsterTypesInLocation = getUniqueMonsterTypes(aliveMonsters)
  return power.filterMonsterTypeTargetsForItem(item, allMonsterTypesInLocation);
}

export function potentialTargetMonstersForItem(item: Item, location: GameLocation | undefined): Monster[] {
  const power = powerFactory.getPower(item.power);
  if (location === undefined) {
    return []
  }
  if (power.itemTargetType !== 'monsters') {
    return [];
  }
  // this item targets monster types, not individuals
  if (item.target !== 'pick' && item.target !== 'random') {
    return []
  }

  return power.filterMonsterTargetsForItem(item, location.monsters ?? []);
}

export function potentialTargetLocationsForItem(item: Item): GameLocation[] {
  const locationStore = useLocationStore();
  const power = powerFactory.getPower(item.power);

  if (power.itemTargetType !== 'locations') {
    return [];
  }
  return power.filterLocationTargetsForItem(item, locationStore.locations);
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
    description: `${tokenDescription} Collected from ${location.name}.`,
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



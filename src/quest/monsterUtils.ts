import type {Monster, MonsterType, MonsterTypeId} from '../types'
import {useQuestStore} from '@/stores/questStore.ts';
import {monsterTypesById, monsterTypeById} from "@/data/monsterTypesLoader";


/**
 * Get unique monster type IDs from available monsters
 * @param monsters Array of monsters to extract type IDs from
 * @returns Array of unique monster type IDs
 */
export function getUniqueMonsterTypes(monsters: Monster[]): MonsterType[] {
  if (!monsters || !monsters.length) return []
  
  // Get all unique monster types
  const types = new Set<MonsterTypeId>()
  
  monsters.forEach(monster => {
    types.add(monster.type as MonsterTypeId)
  })
  
  return Array.from(types).map( id=>monsterTypesById[id])
}



/**
 * Get monster level name from type ID
 * @param monsterTypeId The monster type ID
 * @returns Capitalized level name
 */
export function getMonsterLevel(monsterTypeId: MonsterTypeId): string {
  const monsterType = monsterTypeById(monsterTypeId)
  
  // Capitalize the level
  return monsterType.level.charAt(0).toUpperCase() + monsterType.level.slice(1)
}

/**
 * Get monster species name from type ID
 * @param monsterTypeId The monster type ID
 * @returns Capitalized species name
 */
export function getMonsterSpecies(monsterTypeId: MonsterTypeId): string {
  const monsterType = monsterTypeById(monsterTypeId)
  
  // Capitalize the species
  return monsterType.species.charAt(0).toUpperCase() + monsterType.species.slice(1)
}

/**
 * Check if all monsters in an array are defeated
 * @param monsters - Array of monsters to check
 * @returns true if all monsters are defeated, false otherwise
 */
export function areAllMonstersDefeated(monsters: Monster[]): boolean {
  if (!monsters || monsters.length === 0) return false;
  return monsters.every(monster => !monster.alive);
}

/**
 * Get the monster XP value, accounting for player count scaling if applicable
 * @returns The XP value
 * @param monsterTypeId
 */
export function getMonsterXP(monsterTypeId: MonsterTypeId): number {
  const questStore = useQuestStore();

  // Find the monster type definition
  const monsterType = monsterTypesById[monsterTypeId]
  if (!monsterType) return 0

  // Apply player count scaling if applicable
  const multiplier = monsterType.lesserCount === "playerCount" ? questStore.playerCount : 1;

  return monsterType.xp * multiplier;
}

/**
 * Get the drink required to defeat the monster
 * @returns The name of the drink value
 * @param monsterTypeId
 */
export function getMonsterDrink(monsterTypeId: MonsterTypeId): string {
  // Find the monster type definition
  const monsterType = monsterTypesById[monsterTypeId]
  if (!monsterType) return "?"

  return monsterType.drink
}

/**
 * Get the monster alchol Units, accounting for player count scaling if applicable
 * @returns The Booze value
 * @param monsterTypeId
 */
export function getMonsterBooze(monsterTypeId: MonsterTypeId): number {
  const questStore = useQuestStore();

  // Find the monster type definition
  const monsterType = monsterTypesById[monsterTypeId]
  if (!monsterType) return 0

  // Apply player count scaling if applicable
  const multiplier = monsterType.lesserCount === "playerCount" ? questStore.playerCount : 1;
  return monsterType.booze * multiplier;
}

/**
 * Get the monster soft drink value, accounting for player count scaling if applicable
 * @returns The Soft drink value
 * @param monsterTypeId
 */
export function getMonsterSoft(monsterTypeId: MonsterTypeId): number {
  const questStore = useQuestStore();

  // Find the monster type definition
  const monsterType = monsterTypesById[monsterTypeId]
  if (!monsterType) return 0

  // Apply player count scaling if applicable
  const multiplier = monsterType.lesserCount === "playerCount" ? questStore.playerCount : 1;

  return monsterType.soft * multiplier;
}
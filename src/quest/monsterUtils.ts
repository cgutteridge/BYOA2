import type {Monster, MonsterTypeId} from '../types'
import {useQuestStore} from '@/stores/questStore.ts';
import {monsterTypes, monsterTypesById} from "@/data";

/**
 * Get unique monster species from available monsters
 * @param monsters Array of monsters to extract species from
 * @returns Array of unique species strings
 */
export function getUniqueMonsterSpecies(monsters: Monster[]): string[] {
  if (!monsters || !monsters.length) return []
  
  // Get all species from filtered monsters
  const types = new Set<string>()
  
  monsters.forEach(monster => {
    const monsterType = monsterTypes.find(mt => mt.id === monster.type)
    if (monsterType) {
      types.add(monsterType.species)
    }
  })
  
  return Array.from(types)
}

/**
 * Get unique monster type IDs from available monsters
 * @param monsters Array of monsters to extract type IDs from
 * @returns Array of unique monster type IDs
 */
export function getUniqueMonsterTypes(monsters: Monster[]): MonsterTypeId[] {
  if (!monsters || !monsters.length) return []
  
  // Get all unique monster types
  const types = new Set<MonsterTypeId>()
  
  monsters.forEach(monster => {
    types.add(monster.type as MonsterTypeId)
  })
  
  return Array.from(types)
}

/**
 * Get monster count by species
 * @param monsters Array of monsters to count
 * @param species Species to count
 * @returns NumberInput of monsters of the specified species
 */
export function getMonsterCountBySpecies(monsters: Monster[], species: string): number {
  // Get all monster types matching this species
  const monsterTypeIds = monsterTypes
    .filter(mt => mt.species === species)
    .map(mt => mt.id)
  
  // Count monsters that match any of these type IDs
  return monsters.filter(monster => 
    monsterTypeIds.includes(monster.type)
  ).length
}

/**
 * Get monster level name from type ID
 * @param monsterTypeId The monster type ID
 * @returns Capitalized level name
 */
export function getMonsterLevel(monsterTypeId: string): string {
  const monsterType = monsterTypes.find(mt => mt.id === monsterTypeId)
  if (!monsterType) return 'Unknown'
  
  // Capitalize the level
  return monsterType.level.charAt(0).toUpperCase() + monsterType.level.slice(1)
}

/**
 * Get monster species name from type ID
 * @param monsterTypeId The monster type ID
 * @returns Capitalized species name
 */
export function getMonsterSpecies(monsterTypeId: string): string {
  const monsterType = monsterTypes.find(mt => mt.id === monsterTypeId)
  if (!monsterType) return 'Unknown'
  
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
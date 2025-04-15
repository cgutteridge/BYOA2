import type { Monster } from '../types'
import { monsterTypes } from '../data/monsterTypes.ts'

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
 * Get monster count by species
 * @param monsters Array of monsters to count
 * @param species Species to count
 * @returns Number of monsters of the specified species
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
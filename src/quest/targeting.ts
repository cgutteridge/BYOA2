import type { Item } from '../types/item.ts'
import type { Monster, MonsterFlag, MonsterLevel } from '../types'
import { monsterTypes } from '../data/monsterTypes.ts'

/**
 * Helper function to get valid monster targets for an item
 * @param item The item to check targets for
 * @param monsters Array of monsters to filter
 * @returns Array of monsters that are valid targets
 */
export function validTargets(item: Item, monsters: Monster[]): Monster[] {
  if (!item || !monsters || !monsters.length) {
    return []
  }
  
  // Filter monsters based on item targeting criteria
  return monsters.filter(monster => {
    // Only include alive monsters
    if (!monster.alive) return false
    
    // Find the monster type definition
    const monsterType = monsterTypes.find(mt => mt.id === monster.type)
    if (!monsterType) {
      return false
    }
    
    // Filter by level if specified in item
    if (item.targetFilters?.levels?.length) {
      if (!item.targetFilters.levels.includes(monsterType.level as MonsterLevel)) {
        return false
      }
    }
    
    // Filter by species if specified in item
    if (item.targetFilters?.species?.length) {
      if (!item.targetFilters.species.includes(monsterType.species)) {
        return false
      }
    }
    
    // Filter by flags if specified in item
    if (item.targetFilters?.flags?.length) {
      // Monster must have at least one of the specified flags
      const hasMatchingFlag = item.targetFilters.flags.some(flag => 
        monsterType.flags.includes(flag as MonsterFlag)
      )
      
      if (!hasMatchingFlag) {
        return false
      }
    }
    
    return true
  })
}

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
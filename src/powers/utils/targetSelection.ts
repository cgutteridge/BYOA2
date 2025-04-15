import type { Item } from '../../types/item'
import type { Monster, MonsterFlag } from '../../types'
import { canTargetMonster } from './targetValidation'
import { filterToMonsterArray } from './typeChecking'
import { monsterTypes } from '../../data/monsterTypes'

/**
 * Get all valid monster targets for an item
 */
export function getValidMonsterTargets(item: Item, monsters: Monster[]): Monster[] {
  if (!monsters || !monsters.length) {
    return []
  }
  
  return monsters.filter(monster => canTargetMonster(item, monster))
}

/**
 * Get all valid monster types that can be targeted
 */
export function getValidMonsterTypes(item: Item, monsters: Monster[]): string[] {
  if (!monsters || !monsters.length) {
    return []
  }
  
  // Get all valid monsters first
  const validMonsters = getValidMonsterTargets(item, monsters)
  
  // Extract unique monster types
  const validTypes = new Set<string>()
  
  validMonsters.forEach(monster => {
    validTypes.add(monster.type)
  })
  
  return Array.from(validTypes)
}

/**
 * Get all valid monster types for the item with filtering logic
 * This version is used for type-targeting powers that need detailed filtering
 */
export function getValidMonsterTypesWithFilters(item: Item, monsters: Monster[]): string[] {
  if (!monsters || !monsters.length) {
    return []
  }
  
  // Get all unique monster types that match the item's targeting criteria
  const validTypes = new Set<string>()
  
  monsters.forEach(monster => {
    if (monster.alive) {
      const monsterType = monsterTypes.find(mt => mt.id === monster.type)
      if (monsterType) {
        // Apply the same filtering logic as in canTarget
        let isValid = true
        
        if (item.targetFilters) {
          // Check level restrictions
          if (item.targetFilters.levels && item.targetFilters.levels.length > 0) {
            if (!item.targetFilters.levels.includes(monsterType.level)) {
              isValid = false
            }
          }
          
          // Check species restrictions
          if (item.targetFilters.species && item.targetFilters.species.length > 0) {
            if (!item.targetFilters.species.includes(monsterType.species)) {
              isValid = false
            }
          }
          
          // Check flag restrictions
          if (item.targetFilters.flags && item.targetFilters.flags.length > 0) {
            const hasValidFlag = monsterType.flags.some((flag: MonsterFlag) => 
              item.targetFilters?.flags?.includes(flag)
            )
            if (!hasValidFlag) {
              isValid = false
            }
          }
        }
        
        if (isValid) {
          validTypes.add(monster.type)
        }
      }
    }
  })
  
  return Array.from(validTypes)
}

/**
 * Generic handler that returns appropriate targets based on the item's target mode
 */
export function getTargetsForItem(item: Item, monsters: Monster[]): Monster[] | string[] {
  if (!item.target || item.target === 'random' || item.target === 'pick') {
    // For individual monster targeting
    return getValidMonsterTargets(item, monsters)
  } else {
    // For type targeting
    return getValidMonsterTypes(item, monsters)
  }
}

/**
 * Generic getValidTargets implementation for all powers
 */
export function getValidTargets(item: Item, targets: any[]): Monster[] | string[] {
  // Convert to Monster[] and filter out invalid targets
  const monsters = filterToMonsterArray(targets)
  
  if (!monsters || !monsters.length) {
    return []
  }
  
  // Use the shared targeting function to get appropriate targets based on mode
  return getTargetsForItem(item, monsters)
} 
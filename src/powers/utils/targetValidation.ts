import type { Item } from '../../types/item'
import type { Monster, MonsterFlag } from '../../types'
import { monsterTypes } from '../../data/monsterTypes'
import { isMonster, isMonsterType } from './typeChecking'

/**
 * Checks if a monster meets the targeting criteria for an item
 */
export function canTargetMonster(item: Item, monster: Monster): boolean {
  // Check if monster is alive
  if (!monster.alive) {
    return false
  }
  
  // Find the monster type definition
  const monsterType = monsterTypes.find(mt => mt.id === monster.type)
  if (!monsterType) {
    return false
  }
  
  // Apply power-specific level restrictions
  // These are hardcoded restrictions like "shrink only works on elite/boss"
  if (item.power === 'shrink' && (monsterType.level !== 'boss' && monsterType.level !== 'elite')) {
    return false
  }
  
  // For split, check if the monster has the 'splits' property
  if (item.power === 'split') {
    if (monsterType.level !== 'grunt' || !monsterType.splits) {
      return false
    }
  }
  
  // Check target filters from the item
  if (item.targetFilters) {
    // Check level restrictions
    if (item.targetFilters.levels && item.targetFilters.levels.length > 0) {
      if (!item.targetFilters.levels.includes(monsterType.level)) {
        return false
      }
    }
    
    // Check species restrictions
    if (item.targetFilters.species && item.targetFilters.species.length > 0) {
      if (!item.targetFilters.species.includes(monsterType.species)) {
        return false
      }
    }
    
    // Check flag restrictions
    if (item.targetFilters.flags && item.targetFilters.flags.length > 0) {
      const hasValidFlag = monsterType.flags.some((flag: MonsterFlag) => 
        item.targetFilters?.flags?.includes(flag)
      )
      if (!hasValidFlag) {
        return false
      }
    }
  }
  
  return true
}

/**
 * Generic canTarget implementation for all powers
 */
export function canTarget(item: Item, target: any): boolean {
  // Handle individual monster targeting
  if (isMonster(target)) {
    return canTargetMonster(item, target)
  }
  
  // Handle type targeting (string representing a monster type)
  if (isMonsterType(target)) {
    // In a real implementation, this would check if there are any
    // alive monsters of this type that could be targeted
    return true
  }
  
  return false
} 
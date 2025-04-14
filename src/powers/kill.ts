import type { Item } from '../types/item'
import type { Monster, MonsterFlag } from '../types'
import type { PowerFunction } from './types'
import { toggleMonsterStatus } from '../helpers/combatHelper'

// Kill One power implementation
export const killOne: PowerFunction = {
  execute: (item: Item, target: Monster) => {
    console.log(`Using ${item.name} to kill ${target.name}`)
    
    // Toggle the monster status to defeat it
    if (target.alive) {
      toggleMonsterStatus(target)
    }
  },
  
  canTarget: (item: Item, target: any): boolean => {
    // Check if target is a Monster
    if (!target || typeof target !== 'object' || !('type' in target) || !('alive' in target)) {
      return false
    }
    
    // Check if monster is alive
    if (!target.alive) {
      return false
    }
    
    // Check target filters
    if (item.targetFilters) {
      // Check level restrictions
      if (item.targetFilters.levels && item.targetFilters.levels.length > 0) {
        const monster = target as Monster
        const monsterType = getMonsterType(monster.type)
        if (monsterType && !item.targetFilters.levels.includes(monsterType.level)) {
          return false
        }
      }
      
      // Check species restrictions
      if (item.targetFilters.species && item.targetFilters.species.length > 0) {
        const monster = target as Monster
        const monsterType = getMonsterType(monster.type)
        if (monsterType && !item.targetFilters.species.includes(monsterType.species)) {
          return false
        }
      }
      
      // Check flag restrictions
      if (item.targetFilters.flags && item.targetFilters.flags.length > 0) {
        const monster = target as Monster
        const monsterType = getMonsterType(monster.type)
        if (monsterType) {
          const hasValidFlag = monsterType.flags.some((flag: MonsterFlag) => 
            item.targetFilters?.flags?.includes(flag)
          )
          if (!hasValidFlag) {
            return false
          }
        }
      }
    }
    
    return true
  },
  
  getValidTargets: (_item: Item): Monster[] => {
    // This will be implemented to return all valid monsters in the current location
    return []
  },
  
  getTargetDescription: (item: Item): string => {
    const filters = []
    
    if (item.targetFilters?.flags?.length) {
      filters.push(`${item.targetFilters.flags.join('/')} creatures`)
    }
    
    if (item.targetFilters?.levels?.length) {
      filters.push(`${item.targetFilters.levels.join('/')} monsters`)
    }
    
    if (item.targetFilters?.species?.length) {
      filters.push(`${item.targetFilters.species.join('/')} species`)
    }
    
    if (filters.length) {
      return `Can target ${filters.join(' and ')}.`
    }
    
    return 'Can target any monster.'
  }
}

// Kill All power implementation
export const killAll: PowerFunction = {
  execute: (item: Item, targetType: string) => {
    console.log(`Using ${item.name} to kill all monsters of type ${targetType}`)
    
    // This will be implemented in a later stage to:
    // 1. Find all monsters matching the target type
    // 2. Mark them all as defeated
    // 3. Award XP to the player
    // 4. Maybe trigger special effects
  },
  
  canTarget: (_item: Item, targetType: any): boolean => {
    // Check if targetType is a string representing a monster type
    if (typeof targetType !== 'string') {
      return false
    }
    
    // Check if there are any alive monsters of this type
    // (Will be implemented in later stages)
    return true
  },
  
  getValidTargets: (_item: Item): string[] => {
    // This will return unique monster types in the current location
    return []
  },
  
  getTargetDescription: (_item: Item): string => {
    return 'Can target all monsters of a specific type.'
  }
}

// Helper function to get monster type details
function getMonsterType(typeId: string) {
  // Import here to avoid circular dependencies
  const { monsterTypes } = require('../data/monsterTypes')
  return monsterTypes.find((type: any) => type.id === typeId)
} 
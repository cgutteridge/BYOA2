import type { Item } from '../types/item'
import type { Monster, MonsterFlag } from '../types'
import type { PowerFunction } from './types'
import { toggleMonsterStatus } from '../quest/combat.ts'
import { monsterTypes } from '../data/monsterTypes.ts'

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
    
    // Check target filters - moved from validTargets in targeting.ts
    if (item.targetFilters) {
      // Find the monster type definition
      const monster = target as Monster
      const monsterType = monsterTypes.find(mt => mt.id === monster.type)
      if (!monsterType) {
        return false
      }
      
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
  },
  
  getValidTargets: (item: Item, monsters: Monster[]): Monster[] => {
    if (!monsters || !monsters.length) {
      return []
    }
    
    // Filter monsters based on canTarget logic
    return monsters.filter(monster => killOne.canTarget(item, monster))
  },
  
  // UI properties
  displayName: "Kill",
  icon: "⚔️",
  glowColor: "rgba(255, 0, 0, 0.8)"
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
  
  canTarget: (item: Item, targetType: any): boolean => {
    // Check if targetType is a string representing a monster type
    if (typeof targetType !== 'string') {
      return false
    }
    
    // Check if there are any alive monsters of this type
    // (Will be implemented in later stages)
    return true
  },
  
  getValidTargets: (item: Item, monsters: Monster[]): string[] => {
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
  },
  
  // UI properties
  displayName: "Kill All",
  icon: "⚔️",
  glowColor: "rgba(255, 0, 0, 0.8)"
}

// Helper function to get monster type details
function getMonsterType(typeId: string) {
  // Import here to avoid circular dependencies
  const { monsterTypes } = require('../data/monsterTypes')
  return monsterTypes.find((type: any) => type.id === typeId)
} 
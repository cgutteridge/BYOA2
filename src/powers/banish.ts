import type { Item } from '../types/item'
import type { Monster, MonsterFlag } from '../types'
import type { PowerFunction } from './types'
import { useQuestStore } from '../stores/questStore'
import { banishMonster } from '../helpers/combatHelper'

// Banish power implementation
export const banish: PowerFunction = {
  execute: (item: Item, target: Monster) => {
    console.log(`Using ${item.name} to banish ${target.name}`)
    
    // Use the dedicated banishMonster function
    if (target.alive) {
      banishMonster(target)
    }
  },
  
  canTarget: (item: Item, target: any): boolean => {
    // Check if target is a Monster
    if (!target || typeof target !== 'object' || !('type' in target) || !('alive' in target)) {
      return false
    }
    
    // Check if monster is alive (can't banish already defeated monsters)
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
  
  getValidTargets: (item: Item): Monster[] => {
    // This will return all valid monsters in the current location
    const questStore = useQuestStore()
    if (!questStore.currentPub || !questStore.currentPub.monsters) {
      return []
    }
    
    // Store reference to canTarget since 'this' won't work in the filter
    const canTargetFunc = banish.canTarget
    
    return questStore.currentPub.monsters.filter(monster => 
      monster.alive && canTargetFunc(item, monster)
    )
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
      return `Can banish ${filters.join(' and ')}.`
    }
    
    return 'Can banish any monster, but they leave no loot behind.'
  }
}

// Helper function to get monster type details
function getMonsterType(typeId: string) {
  // Import here to avoid circular dependencies
  const { monsterTypes } = require('../data/monsterTypes')
  return monsterTypes.find((type: any) => type.id === typeId)
} 
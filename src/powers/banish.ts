import type { Item } from '../types/item'
import type { Monster, MonsterFlag } from '../types'
import type { PowerFunction } from './types'
import { banishMonster } from '../quest/combat.ts'
import { monsterTypes } from '../data/monsterTypes.ts'

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
  
  getValidTargets: (item: Item, targets: Monster[] | any[]): Monster[] => {
    // For banish power, we only care about Monster[] targets
    const monsters = targets.filter(target => 
      target && typeof target === 'object' && 'type' in target && 'alive' in target
    ) as Monster[]
    
    if (!monsters || !monsters.length) {
      return []
    }
    
    // Filter monsters based on canTarget logic
    return monsters.filter(monster => banish.canTarget(item, monster))
  },
  
  // UI properties
  displayName: "Banish",
  icon: "🔮",
  glowColor: "rgba(75, 0, 130, 0.8)"
} 
import type { Item } from '../types/item'
import type { Monster } from '../types'
import type { PowerFunction } from './types'
import { toggleMonsterStatus } from '../quest/combat.ts'
import { isMonster, canTarget, getValidTargets, getValidMonsterTypesWithFilters } from './utils'

// Kill One power implementation
export const killOne: PowerFunction = {
  execute: (item: Item, target: Monster | string) => {
    // Handle individual monster targeting
    if (isMonster(target)) {
      console.log(`Using ${item.name} to kill ${target.name}`)
      
      // Toggle the monster status to defeat it
      if (target.alive) {
        toggleMonsterStatus(target)
      }
    } 
    // Handle type targeting - this would need implementation in the actual game
    else if (typeof target === 'string') {
      console.log(`Using ${item.name} to kill all monsters of type ${target}`)
      
      // TODO: Find all monsters matching the target type
      // and mark them all as defeated (in the actual game implementation)
    }
  },
  
  canTarget,
  getValidTargets,
  
  // UI properties
  displayName: "Kill",
  icon: "⚔️",
  glowColor: "rgba(255, 0, 0, 0.8)"
}

// Helper function for killAll canTarget
function canTargetKillAll(item: Item, targetType: any): boolean {
  // Check if targetType is a string representing a monster type
  if (typeof targetType !== 'string') {
    return false
  }
  
  // Check if there are any alive monsters of this type
  // (Will be implemented in later stages)
  return true
}

// Helper function for killAll getValidTargets
function getValidKillAllTargets(item: Item, targets: any[]): string[] {
  // Convert to Monster[] and filter out invalid targets
  const monsters = targets.filter(target => isMonster(target)) as Monster[]
  
  if (!monsters || !monsters.length) {
    return []
  }
  
  // Use the specialized function for killAll that needs detailed filtering
  return getValidMonsterTypesWithFilters(item, monsters)
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
  
  canTarget: canTargetKillAll,
  getValidTargets: getValidKillAllTargets,
  
  // UI properties
  displayName: "Kill All",
  icon: "⚔️",
  glowColor: "rgba(255, 0, 0, 0.8)"
}

// Helper function to get monster type details - moved to utils folder
/* function getMonsterType(typeId: string) {
  // Import here to avoid circular dependencies
  const { monsterTypes } = require('../data/monsterTypes')
  return monsterTypes.find((type: any) => type.id === typeId)
} */ 
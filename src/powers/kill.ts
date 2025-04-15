import type { Item } from '../types/item'
import type { Monster } from '../types'
import type { PowerFunction } from './types'
import { toggleMonsterStatus } from '../quest/combat.ts'
import { isMonster, canTarget, getValidTargets } from './utils'

// Kill power implementation
export const kill: PowerFunction = {
  execute: (item: Item, target: Monster | string) => {
    // Handle individual monster targeting
    if (isMonster(target)) {
      console.log(`Using ${item.name} to kill ${target.name}`)
      
      // Toggle the monster status to defeat it
      if (target.alive) {
        toggleMonsterStatus(target)
      }
    } 
    // Handle type targeting
    else if (typeof target === 'string') {
      console.log(`Using ${item.name} to kill all monsters of type ${target}`)
      
      // TODO: Find all monsters matching the target type
      // and mark them all as defeated (in the actual game implementation)
      // This would be implemented in a later stage to:
      // 1. Find all monsters matching the target type
      // 2. Mark them all as defeated
      // 3. Award XP to the player
      // 4. Maybe trigger special effects
    }
  },
  
  canTarget,
  getValidTargets,
  
  // UI properties
  displayName: "Kill",
  icon: "⚔️",
  glowColor: "rgba(255, 0, 0, 0.8)"
} 
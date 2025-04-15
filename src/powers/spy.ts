import type { Item } from '../types/item'
import type { Monster } from '../types'
import type { PowerFunction } from './types'
import { isMonster, canTarget, getValidTargets } from './utils'

// Spy power implementation
export const spy: PowerFunction = {
  execute: (item: Item, target: Monster | string) => {
    // Handle individual monster targeting
    if (isMonster(target)) {
      console.log(`Using ${item.name} to spy on ${target.name}`)
      
      if (target.alive) {
        // TODO: In a real implementation, reveal information about the monster
        console.log(`Discovered secrets about ${target.name}!`)
      }
    }
    // Handle type targeting
    else if (typeof target === 'string') {
      console.log(`Using ${item.name} to spy on all monsters of type ${target}`)
      
      // TODO: Find all monsters matching the target type
      // and reveal information about them (in the actual game implementation)
    }
  },
  
  canTarget,
  getValidTargets,
  
  // UI properties
  displayName: "Spy",
  icon: "👁️",
  glowColor: "rgba(0, 128, 0, 0.8)"
} 
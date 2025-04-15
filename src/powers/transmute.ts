import type { Item } from '../types/item'
import type { Monster } from '../types'
import type { PowerFunction } from './types'
import { isMonster, canTarget, getValidTargets } from './utils'

// Transmute power implementation
export const transmute: PowerFunction = {
  execute: (item: Item, target: Monster | string) => {
    // Handle individual monster targeting
    if (isMonster(target)) {
      console.log(`Using ${item.name} to transmute ${target.name}`)
      
      if (target.alive) {
        // TODO: In a real implementation, transform the monster into another type
        console.log(`${target.name} has been transmuted to a different monster!`)
      }
    }
    // Handle type targeting
    else if (typeof target === 'string') {
      console.log(`Using ${item.name} to transmute all monsters of type ${target}`)
      
      // TODO: Find all monsters matching the target type
      // and transmute them all (in the actual game implementation)
    }
  },
  
  canTarget,
  getValidTargets,
  
  // UI properties
  displayName: "Transmute",
  icon: "✨",
  glowColor: "rgba(138, 43, 226, 0.8)"
} 
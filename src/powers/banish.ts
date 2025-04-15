import type { Item } from '../types/item'
import type { Monster } from '../types'
import type { PowerFunction } from './types'
import { banishMonster } from '../quest/combat.ts'
import { isMonster, canTarget, getValidTargets } from './utils'

// Banish power implementation
export const banish: PowerFunction = {
  execute: (item: Item, target: Monster | string) => {
    // Handle individual monster targeting
    if (isMonster(target)) {
      console.log(`Using ${item.name} to banish ${target.name}`)
      
      // Use the dedicated banishMonster function
      if (target.alive) {
        banishMonster(target)
      }
    }
    // Handle type targeting - this would need implementation in the actual game
    else if (typeof target === 'string') {
      console.log(`Using ${item.name} to banish all monsters of type ${target}`)
      
      // TODO: Find all monsters matching the target type
      // and banish them all (in the actual game implementation)
    }
  },
  
  canTarget,
  getValidTargets,
  
  // UI properties
  displayName: "Banish",
  icon: "🔮",
  glowColor: "rgba(75, 0, 130, 0.8)"
} 
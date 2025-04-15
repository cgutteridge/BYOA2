import type { Item } from '../types/item'
import type { Monster } from '../types'
import type { PowerFunction } from './types'
import { isMonster, canTarget, getValidTargets } from './utils'

// Freeze power implementation
export const freeze: PowerFunction = {
  execute: (item: Item, target: Monster | string) => {
    // Handle individual monster targeting
    if (isMonster(target)) {
      console.log(`Using ${item.name} to freeze ${target.name}`)
      
      if (target.alive) {
        // TODO: In a real implementation, apply freeze status to monster
        console.log(`${target.name} has been frozen solid!`)
      }
    }
    // Handle type targeting
    else if (typeof target === 'string') {
      console.log(`Using ${item.name} to freeze all monsters of type ${target}`)
      
      // TODO: Find all monsters matching the target type
      // and freeze them all (in the actual game implementation)
    }
  },
  
  canTarget,
  getValidTargets,
  
  // UI properties
  displayName: "Freeze",
  icon: "❄️",
  glowColor: "rgba(0, 191, 255, 0.8)"
} 
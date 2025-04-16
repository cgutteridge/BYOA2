import type { Item } from '../types/item'
import type { Monster } from '../types'
import type { ItemPower } from './types'
import { isMonster, canTarget, getValidTargets } from './utils'

// Pickpocket power implementation
export const pickpocket: ItemPower = {
  execute: (item: Item, target: Monster | string) => {
    // Handle individual monster targeting
    if (isMonster(target)) {
      console.log(`Using ${item.name} to pickpocket ${target.name}`)
      
      if (target.alive) {
        // TODO: In a real implementation, steal an item from the monster
        // and add it to the player's inventory
        console.log(`Successfully pickpocketed an item from ${target.name}!`)
      }
    }
    // Handle type targeting
    else if (typeof target === 'string') {
      console.log(`Using ${item.name} to pickpocket all monsters of type ${target}`)
      
      // TODO: Find all monsters matching the target type
      // and pickpocket from them all (in the actual game implementation)
    }
  },
  
  canTarget,
  getValidTargets,
  
  // UI properties
  displayName: "Pickpocket",
  icon: "👝",
  glowColor: "rgba(139, 69, 19, 0.8)"
} 
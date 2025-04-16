import type { Item } from '../types/item'
import type { Monster } from '../types'
import type { ItemPower } from './types'
import { isMonster, canTarget, getValidTargets } from './utils'

// Split power implementation
export const split: ItemPower = {
  execute: (item: Item, target: Monster | string) => {
    // Handle individual monster targeting
    if (isMonster(target)) {
      console.log(`Using ${item.name} to split ${target.name}`)
      
      if (target.alive) {
        // TODO: In a real implementation, this would:
        // 1. Find the monster type definition
        // 2. Determine the split type from monsterType.splits
        // 3. Create multiple instances of that monster
        // 4. Add them to the combat encounter
        console.log(`${target.name} has split into multiple monsters!`)
      }
    }
    // Handle type targeting
    else if (typeof target === 'string') {
      console.log(`Using ${item.name} to split all monsters of type ${target}`)
      
      // TODO: Find all monsters matching the target type
      // and split them all (in the actual game implementation)
    }
  },
  
  canTarget,
  getValidTargets,
  
  // UI properties
  displayName: "Split",
  icon: "👬",
  glowColor: "rgba(255, 215, 0, 0.8)"
} 
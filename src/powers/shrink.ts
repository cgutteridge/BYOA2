import type { Item } from '../types/item'
import type { Monster } from '../types'
import type { PowerFunction } from './types'
import { isMonster, canTarget, getValidTargets } from './utils'

// Function to get the next lower monster level
function getLowerLevel(currentLevel: string): string | null {
  const levelHierarchy = ['boss', 'elite', 'grunt', 'minion']
  const currentIndex = levelHierarchy.indexOf(currentLevel)
  
  if (currentIndex === -1 || currentIndex === levelHierarchy.length - 1) {
    return null
  }
  
  return levelHierarchy[currentIndex + 1]
}

// Shrink power implementation - turns a boss/elite monster into a weaker version
export const shrink: PowerFunction = {
  execute: (item: Item, target: Monster | string) => {
    // Handle individual monster targeting
    if (isMonster(target)) {
      console.log(`Using ${item.name} to shrink ${target.name}`)
      
      if (target.alive) {
        // TODO: In a real implementation, this would:
        // 1. Find the monster type definition
        // 2. Determine what the shrunk version should be (based on level)
        // 3. Replace the monster with the shrunk version
        // 4. Update the UI
        console.log(`${target.name} has been shrunk to a weaker form!`)
      }
    }
    // Handle type targeting
    else if (typeof target === 'string') {
      console.log(`Using ${item.name} to shrink all monsters of type ${target}`)
      
      // TODO: Find all monsters matching the target type
      // and shrink them all (in the actual game implementation)
    }
  },
  
  canTarget,
  getValidTargets,
  
  // UI properties
  displayName: "Shrink",
  icon: "⬇️",
  glowColor: "rgba(138, 43, 226, 0.8)"
} 
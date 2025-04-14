import type { EnhancedItem } from '../types/item'
import type { Monster } from '../types'
import type { PowerFunction } from './types'

// Kill One power implementation
export const killOne: PowerFunction = {
  execute: (item: EnhancedItem, target: Monster) => {
    // This will be implemented in a later stage
    console.log(`Using ${item.name} to kill ${target.name}`)
    
    // In the future, this would:
    // 1. Mark the monster as defeated
    // 2. Award XP to the player
    // 3. Maybe trigger special effects
  },
  
  canTarget: (item: EnhancedItem, target: any): boolean => {
    // Check if target is a Monster
    if (!target || typeof target !== 'object' || !('type' in target) || !('alive' in target)) {
      return false
    }
    
    // Check if monster is alive
    if (!target.alive) {
      return false
    }
    
    // Check target filters (to be implemented)
    return true
  },
  
  getValidTargets: (item: EnhancedItem): Monster[] => {
    // This will be implemented to return all valid monsters in the current location
    return []
  },
  
  getTargetDescription: (item: EnhancedItem): string => {
    const filters = []
    
    if (item.targetFilters?.flags?.length) {
      filters.push(`${item.targetFilters.flags.join('/')} creatures`)
    }
    
    if (item.targetFilters?.levels?.length) {
      filters.push(`${item.targetFilters.levels.join('/')} monsters`)
    }
    
    if (item.targetFilters?.species?.length) {
      filters.push(`${item.targetFilters.species.join('/')} species`)
    }
    
    if (filters.length) {
      return `Can target ${filters.join(' and ')}.`
    }
    
    return 'Can target any monster.'
  }
}

// Kill All power implementation
export const killAll: PowerFunction = {
  execute: (item: EnhancedItem, targetType: string) => {
    // This will be implemented in a later stage
    console.log(`Using ${item.name} to kill all monsters of type ${targetType}`)
    
    // In the future, this would:
    // 1. Find all monsters matching the target type
    // 2. Mark them all as defeated
    // 3. Award XP to the player
    // 4. Maybe trigger special effects
  },
  
  canTarget: (item: EnhancedItem, targetType: any): boolean => {
    // Check if targetType is a string representing a monster type
    if (typeof targetType !== 'string') {
      return false
    }
    
    // Check if there are any alive monsters of this type
    // (Will be implemented in later stages)
    return true
  },
  
  getValidTargets: (item: EnhancedItem): string[] => {
    // This will return unique monster types in the current location
    return []
  },
  
  getTargetDescription: (item: EnhancedItem): string => {
    return 'Can target all monsters of a specific type.'
  }
} 
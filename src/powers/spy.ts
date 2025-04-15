import type { Item } from '../types/item'
import type { Pub, Monster } from '../types'
import type { PowerFunction } from './types'
import { scoutLocation } from '../quest/scoutLocation.ts'

// Spy power implementation
export const spy: PowerFunction = {
  execute: async (item: Item, target: Pub) => {
    console.log(`Using ${item.name} to spy on ${target.name}`)
    
    // Scout the location
    if (!target.scouted) {
      await scoutLocation(target)
    }
  },
  
  canTarget: (item: Item, target: any): boolean => {
    // Check if target is a Pub
    if (!target || typeof target !== 'object' || !('locationType' in target) || !('lat' in target) || !('lng' in target)) {
      return false
    }
    
    // Check if pub is already scouted
    if (target.scouted) {
      return false
    }
    
    return true
  },
  
  getValidTargets: (item: Item, targets: Monster[] | Pub[] | any[]): any[] => {
    // For spy power, we only care about Pub[] targets
    // But we need to accept Monster[] to satisfy the interface
    const pubs = targets.filter(target => 
      target && typeof target === 'object' && 'locationType' in target && 'scouted' in target
    ) as Pub[]
    
    if (!pubs || !pubs.length) {
      return []
    }
    
    // Filter pubs based on canTarget logic
    return pubs.filter(pub => spy.canTarget(item, pub))
  },
  
  // UI properties
  displayName: "Spy",
  icon: "🔭",
  glowColor: "rgba(0, 128, 255, 0.8)"
} 
import type { Item, Monster } from '../types'
import { ItemPower, PowerResult } from './types'
import { banishMonster } from '../quest/combat.ts'
import { isMonster, canTarget, getValidTargets } from './utils'

// Banish power implementation
export class BanishPower extends ItemPower {
  static displayName = "Banish";
  static icon = "🔮";
  static glowColor = "rgba(75, 0, 130, 0.8)";

  static targetTypes(item: Item): string[] {
    // Return valid monster types based on item's targetFilters
    // This would need to access a list of all monster types
    return item.targetFilters?.species || [];
  }

  static targetMonsters(item: Item, monsters: Monster[]): Monster[] {
    // Filter monsters based on item's targetFilters
    return monsters.filter(monster => {
      // Only include alive monsters
      if (!monster.alive) return false;
      
      // Check if monster matches the filters
      if (item.targetFilters) {
        // Filter by species if specified
        if (item.targetFilters.species?.length && !item.targetFilters.species.includes(monster.type as any)) {
          return false;
        }
        
        // Additional filters could be implemented here
      }
      
      return true;
    });
  }

  static hasInputs(item: Item): { target: boolean; result: boolean } {
    // Banish requires target input but no result input
    return { target: true, result: false };
  }

  static applyToMonster(item: Item, monsterId: string): PowerResult {
    // This would need to find the monster with the given ID in the actual implementation
    console.log(`Using ${item.name} to banish monster ${monsterId}`);
    
    // In real implementation, would find the monster and call banishMonster()
    // For now, just simulate success
    this.reduceUses(item);
    
    return {
      success: true,
      message: `${item.name} banished the monster from this realm!`
    };
  }

  static applyToType(item: Item, type: string): PowerResult {
    console.log(`Using ${item.name} to banish all monsters of type ${type}`);
    
    // In real implementation:
    // 1. Find all monsters of the specified type
    // 2. Banish each one
    // 3. Collect messages
    this.reduceUses(item);
    
    return {
      success: true,
      message: `${item.name} banished all ${type}s from this realm!`
    };
  }
} 
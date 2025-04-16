import type { Item } from '../types/item'
import type { Monster } from '../types'
import { ItemPower, PowerResult } from './types'

// Spy power implementation
export class SpyPower extends ItemPower {
  static displayName = "Spy";
  static icon = "👁️";
  static glowColor = "rgba(0, 128, 0, 0.8)";

  static targetTypes(item: Item): string[] {
    // Return valid monster types based on item's targetFilters
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
      }
      
      return true;
    });
  }

  static hasInputs(item: Item): { target: boolean; result: boolean } {
    // Spy requires target input but no result input
    return { target: true, result: false };
  }

  static applyToMonster(item: Item, monsterId: string): PowerResult {
    console.log(`Using ${item.name} to spy on monster ${monsterId}`);
    
    // In real implementation, would find the monster and reveal information
    this.reduceUses(item);
    
    return {
      success: true,
      message: `${item.name} revealed secrets about the monster!`
    };
  }

  static applyToType(item: Item, type: string): PowerResult {
    console.log(`Using ${item.name} to spy on all monsters of type ${type}`);
    
    // In real implementation:
    // 1. Find all monsters of the specified type
    // 2. Reveal information about each one
    // 3. Collect messages
    this.reduceUses(item);
    
    return {
      success: true,
      message: `${item.name} revealed secrets about all ${type}s!`
    };
  }
} 
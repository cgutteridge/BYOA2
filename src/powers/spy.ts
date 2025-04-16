import type { Item, Monster, MonsterTypeId } from '../types'
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

  static hasInputs(_item: Item): { target: boolean; result: boolean } {
    // Spy requires target input but no result input
    return { target: true, result: false };
  }

  static applyToMonster(item: Item, monsterId: string): PowerResult {
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} revealed secrets about the monster!` : `${item.name} failed to spy on the monster.`
    };
  }

  static applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to spy on all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} revealed secrets about all ${type}s!`
    };
  }
  
  static applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to spy on monster ${monsterId}`);
    
    // In real implementation, would find the monster and reveal information
    // For now, we'll just return success
    return true;
  }
} 
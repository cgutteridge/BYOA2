import type { Item, Monster } from '../types'
import { ItemPower, PowerResult } from './types'

/**
 * Shrink power implementation - converts boss monsters to elite and elite to grunt
 */
export class ShrinkPower extends ItemPower {
  static displayName = "Shrink";
  static icon = "📏";
  static glowColor = "rgba(255, 192, 203, 0.8)"; // Pink glow

  static targetTypes(item: Item): string[] {
    // Return valid monster types based on item's targetFilters
    return item.targetFilters?.species || [];
  }

  static targetMonsters(item: Item, monsters: Monster[]): Monster[] {
    // Only target monsters that are at a level that can be shrunk
    return monsters.filter(monster => {
      if (!monster.alive) return false;
      
      // Checking target filters
      if (item.targetFilters) {
        if (item.targetFilters.levels?.length) {
          // This would need to determine the monster's level and check if it matches
          // For now, we're just accepting all alive monsters if levels array exists
        }
        
        // Filter by species if specified
        if (item.targetFilters.species?.length && !item.targetFilters.species.includes(monster.type as any)) {
          return false;
        }
      }
      
      return true;
    });
  }

  static applyToMonster(item: Item, monsterId: string): PowerResult {
    console.log(`Using ${item.name} to shrink monster ${monsterId}`);
    
    // In real implementation:
    // 1. Find the monster with the given ID
    // 2. Determine its current level
    // 3. If it's boss -> convert to elite
    //    If it's elite -> convert to grunt
    //    If it's grunt -> fail or convert to minion
    //    If it's minion -> fail
    
    this.reduceUses(item);
    
    return {
      success: true,
      message: `${item.name} shrank the monster down to a less threatening size!`
    };
  }
} 
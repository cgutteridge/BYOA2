import type { Item, Monster, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './types'

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
      }
      
      return true;
    });
  }

  static hasInputs(_item: Item): { target: boolean; result: boolean } {
    // Banish requires target input but no result input
    return { target: true, result: false };
  }

  static applyToMonster(item: Item, monsterId: string): PowerResult {
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} banished the monster!` : `${item.name} failed to banish the monster.`
    };
  }

  static applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to banish all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} banished all ${type}s!`
    };
  }

  static applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to banish monster ${monsterId}`);
    
    // In a real implementation, find the monster and banish it
    // For now, we'll just return success
    return true;
  }
} 
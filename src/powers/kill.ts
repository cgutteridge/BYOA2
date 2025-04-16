import type { Item, Monster, MonsterTypeId } from '../types';
import { ItemPower, PowerResult } from './types';

/**
 * Kill power implementation
 */
export class KillPower extends ItemPower {
  static displayName = "Kill";
  static icon = "⚔️";
  static glowColor = "rgba(255, 0, 0, 0.8)";

  static targetTypes(item: Item): string[] {
    return item.targetFilters?.species || [];
  }

  static targetMonsters(item: Item, monsters: Monster[]): Monster[] {
    return monsters.filter(monster => {
      if (!monster.alive) return false;
      
      if (item.targetFilters) {
        if (item.targetFilters.species?.length && !item.targetFilters.species.includes(monster.type as any)) {
          return false;
        }
      }
      
      return true;
    });
  }

  static hasInputs(_item: Item): { target: boolean; result: boolean } {
    return { target: true, result: false };
  }

  static applyToMonster(item: Item, monsterId: string): PowerResult {
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} killed the monster!` : `${item.name} failed to kill the monster.`
    };
  }

  static applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to kill all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} killed all ${type}s!`
    };
  }

  static applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to kill monster ${monsterId}`);
    
    // In a real implementation, find the monster and kill it
    // For now, we'll just return success
    return true;
  }
} 
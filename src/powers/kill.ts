import type { Item } from '../types/item';
import type { Monster } from '../types';
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

  static hasInputs(item: Item): { target: boolean; result: boolean } {
    return { target: true, result: false };
  }

  static applyToMonster(item: Item, monsterId: string): PowerResult {
    console.log(`Using ${item.name} to kill monster ${monsterId}`);
    
    this.reduceUses(item);
    
    return {
      success: true,
      message: `${item.name} killed the monster!`
    };
  }

  static applyToType(item: Item, type: string): PowerResult {
    console.log(`Using ${item.name} to kill all monsters of type ${type}`);
    
    this.reduceUses(item);
    
    return {
      success: true,
      message: `${item.name} killed all ${type}s!`
    };
  }
} 
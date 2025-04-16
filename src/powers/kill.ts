import type { Item, MonsterTypeId } from '../types';
import { ItemPower, PowerResult } from './abstractItemPower';

/**
 * Kill power implementation
 */
export class KillPower extends ItemPower {
  // UI properties
  readonly displayName = "Kill";
  readonly icon = "⚔️";
  readonly glowColor = "rgba(255, 0, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 2;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions = null; // Can target any level

  applyToMonster(item: Item, monsterId: string): PowerResult {
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} killed the monster!` : `${item.name} failed to kill the monster.`
    };
  }

  applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to kill all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} killed all ${type}s!`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to kill monster ${monsterId}`);
    
    // In a real implementation, find the monster and kill it
    // For now, we'll just return success
    return true;
  }
} 
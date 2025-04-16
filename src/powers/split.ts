import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './abstractItemPower'

/**
 * Split power implementation
 */
export class SplitPower extends ItemPower {
  // UI properties
  readonly displayName = "Split";
  readonly icon = "✂️";
  readonly glowColor = "rgba(255, 165, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 3;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions = null; // Can target any level

  useOnMonster(item: Item, monsterId: string): PowerResult {
    // Reduce uses
    this.reduceUses(item);
    
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} split the monster in two!` : `${item.name} failed to split the monster.`
    };
  }

  useOnType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to split all monsters of type ${type}`);
    
    // Reduce uses
    this.reduceUses(item);
    
    // Call the implementation-specific effect method for the type
    const success = this.applyEffectToType(item, type);
    
    // We'll provide a custom message specific to splitting
    return {
      success,
      message: success 
        ? `${item.name} split all ${type}s in two!` 
        : `${item.name} failed to split any ${type}s.`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to split monster ${monsterId}`);
    
    // In a real implementation, find the monster and split it
    // For now, we'll just return success
    return true;
  }

  applyEffectToType(item: Item, type: MonsterTypeId): boolean {
    console.log(`Using ${item.name} to split all monsters of type ${type}`);
    
    // In a real implementation, we would:
    // 1. Find all monsters of this type
    // 2. For each monster, apply the splitting effect
    
    // For now, we'll just return success
    return true;
  }
} 
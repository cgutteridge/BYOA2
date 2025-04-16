import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './abstractItemPower'

/**
 * Spy power implementation
 */
export class SpyPower extends ItemPower {
  // UI properties
  readonly displayName = "Spy";
  readonly icon = "👁️";
  readonly glowColor = "rgba(0, 128, 128, 0.8)";
  
  // Item generation constants
  readonly baseCost = 1;
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
      message: success ? `${item.name} successfully spied on the monster!` : `${item.name} failed to spy on the monster.`
    };
  }

  useOnType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to spy on all monsters of type ${type}`);
    
    // Reduce uses
    this.reduceUses(item);
    
    // Call the implementation-specific effect method for the type
    const success = this.applyEffectToType(item, type);
    
    // We'll provide a custom message specific to spying
    return {
      success,
      message: success 
        ? `${item.name} spied on all ${type}s!` 
        : `${item.name} failed to spy on any ${type}s.`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to spy on monster ${monsterId}`);
    
    // In a real implementation, find the monster and spy on it
    // For now, we'll just return success
    return true;
  }

  applyEffectToType(item: Item, type: MonsterTypeId): boolean {
    console.log(`Using ${item.name} to spy on all monsters of type ${type}`);
    
    // In a real implementation, we would:
    // 1. Find all monsters of this type
    // 2. For each monster, apply the spying effect
    
    // For now, we'll just return success
    return true;
  }
} 
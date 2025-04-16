import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './abstractItemPower'

/**
 * Transmute power implementation
 */
export class TransmutePower extends ItemPower {
  // UI properties
  readonly displayName = "Transmute";
  readonly icon = "🔄";
  readonly glowColor = "rgba(138, 43, 226, 0.8)";
  
  // Item generation constants
  readonly baseCost = 3;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = true;
  readonly levelRestrictions = null; // Can target any level

  useOnMonster(item: Item, monsterId: string): PowerResult {
    // Reduce uses
    this.reduceUses(item);
    
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} transmuted the monster!` : `${item.name} failed to transmute the monster.`
    };
  }

  useOnType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to transmute all monsters of type ${type}`);
    
    // Reduce uses
    this.reduceUses(item);
    
    // Call the implementation-specific effect method for the type
    const success = this.applyEffectToType(item, type);
    
    // We'll provide a custom message specific to transmuting
    return {
      success,
      message: success 
        ? `${item.name} transmuted all ${type}s!` 
        : `${item.name} failed to transmute any ${type}s.`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to transmute monster ${monsterId}`);
    
    // In a real implementation, find the monster and transmute it
    // For now, we'll just return success
    return true;
  }

  applyEffectToType(item: Item, type: MonsterTypeId): boolean {
    console.log(`Using ${item.name} to transmute all monsters of type ${type}`);
    
    // In a real implementation, we would:
    // 1. Find all monsters of this type
    // 2. For each monster, apply the transmutation effect
    
    // For now, we'll just return success
    return true;
  }
} 
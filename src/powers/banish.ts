import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './abstractItemPower'

/**
 * Banish power implementation - removes monsters from the location
 */
export class BanishPower extends ItemPower {
  // UI properties
  readonly displayName = "Banish";
  readonly icon = "🪄";
  readonly glowColor = "rgba(255, 20, 147, 0.8)"; // Deep pink
  
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
      message: success ? `${item.name} banished the monster!` : `${item.name} failed to banish the monster.`
    };
  }

  useOnType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to banish all monsters of type ${type}`);
    
    // Reduce uses
    this.reduceUses(item);
    
    // Call the implementation-specific effect method for the type
    const success = this.applyEffectToType(item, type);
    
    // We'll provide a custom message specific to banishing
    return {
      success,
      message: success 
        ? `${item.name} banished all ${type}s!` 
        : `${item.name} failed to banish any ${type}s.`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to banish monster ${monsterId}`);
    
    // In real implementation, find the monster and remove it
    // For now, we'll just return success
    return true;
  }

  applyEffectToType(item: Item, type: MonsterTypeId): boolean {
    console.log(`Using ${item.name} to banish all monsters of type ${type}`);
    
    // In a real implementation, we would:
    // 1. Find all monsters of this type
    // 2. For each monster, apply the banish effect
    
    // For now, we'll just return success
    return true;
  }
} 
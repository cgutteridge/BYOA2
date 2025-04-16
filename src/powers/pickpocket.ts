import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './abstractItemPower'

/**
 * Pickpocket power implementation
 */
export class PickpocketPower extends ItemPower {
  // UI properties
  readonly displayName = "Pickpocket";
  readonly icon = "🧤";
  readonly glowColor = "rgba(255, 215, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 2;
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
      message: success ? `${item.name} stole from the monster!` : `${item.name} failed to steal anything.`
    };
  }

  useOnType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to pickpocket all monsters of type ${type}`);
    
    // Reduce uses
    this.reduceUses(item);
    
    // Call the implementation-specific effect method for the type
    const success = this.applyEffectToType(item, type);
    
    // We'll provide a custom message specific to pickpocketing
    return {
      success,
      message: success 
        ? `${item.name} picked the pockets of all ${type}s!` 
        : `${item.name} failed to pickpocket any ${type}s.`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to pickpocket monster ${monsterId}`);
    
    // In a real implementation, find the monster and pickpocket it
    // For now, we'll just return success
    return true;
  }

  applyEffectToType(item: Item, type: MonsterTypeId): boolean {
    console.log(`Using ${item.name} to pickpocket all monsters of type ${type}`);
    
    // In a real implementation, we would:
    // 1. Find all monsters of this type
    // 2. For each monster, apply the pickpocket effect
    
    // For now, we'll just return success
    return true;
  }
} 
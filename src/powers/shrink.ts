import type { Item, MonsterTypeId, MonsterLevel } from '../types'
import { ItemPower, PowerResult } from './abstractItemPower'

/**
 * Shrink power implementation - converts boss monsters to elite and elite to grunt
 * Can also convert grunts to minions
 */
export class ShrinkPower extends ItemPower {
  // UI properties
  readonly displayName = "Shrink";
  readonly icon = "📏";
  readonly glowColor = "rgba(255, 192, 203, 0.8)"; // Pink glow
  
  // Direct property declarations
  readonly baseCost = 2;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions: MonsterLevel[] = ['grunt', 'elite', 'boss'];

  useOnMonster(item: Item, monsterId: string): PowerResult {
    // Reduce uses
    this.reduceUses(item);
    
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} shrunk the monster!` : `${item.name} failed to shrink the monster.`
    };
  }

  useOnType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to shrink all monsters of type ${type}`);
    
    // Reduce uses
    this.reduceUses(item);
    
    // Call the implementation-specific effect method for the type
    const success = this.applyEffectToType(item, type);
    
    // We'll provide a custom message specific to shrinking
    return {
      success,
      message: success 
        ? `${item.name} shrunk all ${type}s!` 
        : `${item.name} failed to shrink any ${type}s.`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to shrink monster ${monsterId}`);
    
    // In real implementation:
    // 1. Find the monster with the given ID
    // 2. Determine its current level
    // 3. If it's boss -> convert to elite
    //    If it's elite -> convert to grunt
    //    If it's grunt -> convert to minion
    //    If it's minion -> fail
    
    // For now, we'll just return success
    return true;
  }

  applyEffectToType(item: Item, type: MonsterTypeId): boolean {
    console.log(`Using ${item.name} to shrink all monsters of type ${type}`);
    
    // In a real implementation, we would:
    // 1. Find all monsters of this type
    // 2. For each monster, apply the shrinking effect
    
    // For now, we'll just return success
    return true;
  }
} 
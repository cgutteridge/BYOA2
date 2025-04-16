import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult, PowerConstants } from './types'

/**
 * Split power implementation - splits a monster into multiple weaker ones
 */
export class SplitPower extends ItemPower {
  readonly displayName = "Split";
  readonly icon = "🔪";
  readonly glowColor = "rgba(153, 102, 204, 0.8)";
  
  // Power constants for item generation
  readonly constants: PowerConstants = {
    baseCost: 1,
    canHaveTargetRestriction: true,
    supportsTypeTargeting: true,
    defaultTargetMode: 'random',
    canHaveResultRestriction: false,
    levelRestrictions: ['grunt'] // Can only target grunts
  };

  applyToMonster(item: Item, monsterId: string): PowerResult {
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} split the monster into multiple smaller ones!` : `${item.name} failed to split the monster.`
    };
  }

  applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to split all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} split all ${type}s into multiple smaller ones!`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to split monster ${monsterId}`);
    
    // In real implementation:
    // 1. Find the monster with the given ID
    // 2. Check if it has a "splits" property defining what it splits into
    // 3. If successful, replace it with multiple monsters of that type
    
    // For now, we'll just return success
    return true;
  }
} 
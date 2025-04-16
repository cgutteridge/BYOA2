import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult, PowerConstants } from './types'

/**
 * Shrink power implementation - converts boss monsters to elite and elite to grunt
 * Can also convert grunts to minions
 */
export class ShrinkPower extends ItemPower {
  readonly displayName = "Shrink";
  readonly icon = "📏";
  readonly glowColor = "rgba(255, 192, 203, 0.8)"; // Pink glow
  
  // Power constants for item generation
  readonly constants: PowerConstants = {
    baseCost: 2,
    canHaveTargetRestriction: true,
    supportsTypeTargeting: true,
    defaultTargetMode: 'random',
    canHaveResultRestriction: false,
    levelRestrictions: ['grunt', 'elite', 'boss'] // Can work on grunts, elites, and bosses
  };

  applyToMonster(item: Item, monsterId: string): PowerResult {
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success 
        ? `${item.name} shrank the monster down to a less threatening size!` 
        : `${item.name} failed to shrink the monster.`
    };
  }

  applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to shrink all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} shrank all ${type}s down to a less threatening size!`
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
} 
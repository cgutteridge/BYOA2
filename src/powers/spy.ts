import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult, PowerConstants } from './types'

/**
 * Spy power implementation - reveals information about monsters
 */
export class SpyPower extends ItemPower {
  readonly displayName = "Spy";
  readonly icon = "🔍";
  readonly glowColor = "rgba(100, 149, 237, 0.8)"; // Cornflower blue
  
  // Power constants for item generation
  readonly constants: PowerConstants = {
    baseCost: 2,
    canHaveTargetRestriction: false, // Spy doesn't need target restrictions
    supportsTypeTargeting: false, // Spy doesn't support type targeting
    defaultTargetMode: undefined, // Spy doesn't need a target mode
    canHaveResultRestriction: false,
    levelRestrictions: null // Can target any level
  };

  applyToMonster(item: Item, monsterId: string): PowerResult {
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} revealed information about the monster!` : `${item.name} failed to spy on the monster.`
    };
  }

  applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to spy on all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} revealed information about all ${type}s!`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to spy on monster ${monsterId}`);
    
    // In a real implementation, this would reveal hidden information
    // For now, we'll just return success
    return true;
  }
} 
import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult, PowerConstants } from './types'

/**
 * Pickpocket power implementation - steals items from monsters
 */
export class PickpocketPower extends ItemPower {
  readonly displayName = "Pickpocket";
  readonly icon = "💰";
  readonly glowColor = "rgba(184, 134, 11, 0.8)"; // Dark goldenrod
  
  // Power constants for item generation
  readonly constants: PowerConstants = {
    baseCost: 2,
    canHaveTargetRestriction: true,
    supportsTypeTargeting: true,
    defaultTargetMode: 'random',
    canHaveResultRestriction: false,
    levelRestrictions: null // Can target any level
  };

  applyToMonster(item: Item, monsterId: string): PowerResult {
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} successfully stole an item from the monster!` : `${item.name} failed to pickpocket the monster.`
    };
  }

  applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to pickpocket all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} successfully stole items from all ${type}s!`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to pickpocket monster ${monsterId}`);
    
    // In real implementation:
    // 1. Find the monster with the given ID
    // 2. If it has an item, transfer it to the player even if the monster is alive
    
    // For now, we'll just return success
    return true;
  }
} 
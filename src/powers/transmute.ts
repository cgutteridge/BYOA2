import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult, PowerConstants } from './types'

/**
 * Transmute power implementation - transforms monsters into different types
 */
export class TransmutePower extends ItemPower {
  readonly displayName = "Transmute";
  readonly icon = "✨";
  readonly glowColor = "rgba(138, 43, 226, 0.8)";
  
  // Power constants for item generation
  readonly constants: PowerConstants = {
    baseCost: 1,
    canHaveTargetRestriction: true,
    supportsTypeTargeting: true,
    defaultTargetMode: 'random',
    canHaveResultRestriction: true, // Only transmute has result restrictions
    levelRestrictions: null // Can target any level
  };

  applyToMonster(item: Item, monsterId: string): PowerResult {
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} transmuted the monster into something else!` : `${item.name} failed to transmute the monster.`
    };
  }

  applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to transmute all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} transmuted all ${type}s into something else!`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to transmute monster ${monsterId}`);
    
    // In real implementation:
    // 1. Find the monster with the given ID
    // 2. Determine the new monster type based on item properties
    // 3. Transform the monster into the new type
    
    // For now, we'll just return success
    return true;
  }
} 
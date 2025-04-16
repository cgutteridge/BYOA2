import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult, PowerConstants } from './types'

/**
 * Banish power implementation - removes monsters from the location
 */
export class BanishPower extends ItemPower {
  readonly displayName = "Banish";
  readonly icon = "🪄";
  readonly glowColor = "rgba(255, 20, 147, 0.8)"; // Deep pink
  
  // Power constants for item generation
  readonly constants: PowerConstants = {
    baseCost: 1,
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
      message: success ? `${item.name} banished the monster from this realm!` : `${item.name} failed to banish the monster.`
    };
  }

  applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to banish all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} banished all ${type}s from this realm!`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to banish monster ${monsterId}`);
    
    // In real implementation, find the monster and remove it
    // For now, we'll just return success
    return true;
  }
} 
import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './types'

/**
 * Spy power implementation
 */
export class SpyPower extends ItemPower {
  readonly displayName = "Spy";
  readonly icon = "👁️";
  readonly glowColor = "rgba(0, 128, 0, 0.8)";

  applyToMonster(item: Item, monsterId: string): PowerResult {
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} revealed secrets about the monster!` : `${item.name} failed to spy on the monster.`
    };
  }

  applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to spy on all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} revealed secrets about all ${type}s!`
    };
  }
  
  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to spy on monster ${monsterId}`);
    
    // In real implementation, would find the monster and reveal information
    // For now, we'll just return success
    return true;
  }
} 
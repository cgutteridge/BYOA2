import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './types'

/**
 * Split power implementation - splits monsters into multiple smaller monsters
 */
export class SplitPower extends ItemPower {
  static displayName = "Split";
  static icon = "👬";
  static glowColor = "rgba(255, 215, 0, 0.8)";

  static applyToMonster(item: Item, monsterId: string): PowerResult {
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} split the monster into multiples!` : `${item.name} failed to split the monster.`
    };
  }

  static applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to split all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} split all ${type}s into multiples!`
    };
  }

  static applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to split monster ${monsterId}`);
    
    // In real implementation:
    // 1. Find the monster with the given ID
    // 2. Get the monster type to find what it splits into
    // 3. Create multiple instances of the split monster
    // 4. Add them to the encounter
    
    // For now, we'll just return success
    return true;
  }
} 
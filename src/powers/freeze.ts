import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './types'

/**
 * Freeze power implementation - immobilizes monsters
 */
export class FreezePower extends ItemPower {
  static displayName = "Freeze";
  static icon = "❄️";
  static glowColor = "rgba(0, 191, 255, 0.8)";

  static applyToMonster(item: Item, monsterId: string): PowerResult {
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} froze the monster solid!` : `${item.name} failed to freeze the monster.`
    };
  }

  static applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to freeze all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} froze all ${type}s solid!`
    };
  }

  static applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to freeze monster ${monsterId}`);
    
    // In real implementation:
    // 1. Find the monster with the given ID
    // 2. Apply a freeze status effect
    // 3. Prevent the monster from acting for a certain duration
    
    // For now, we'll just return success
    return true;
  }
} 
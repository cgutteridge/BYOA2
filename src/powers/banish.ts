import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './types'

/**
 * Banish power implementation
 */
export class BanishPower extends ItemPower {
  readonly displayName = "Banish";
  readonly icon = "🔮";
  readonly glowColor = "rgba(75, 0, 130, 0.8)";

  applyToMonster(item: Item, monsterId: string): PowerResult {
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} banished the monster!` : `${item.name} failed to banish the monster.`
    };
  }

  applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to banish all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} banished all ${type}s!`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to banish monster ${monsterId}`);
    
    // In a real implementation, find the monster and banish it
    // For now, we'll just return success
    return true;
  }
} 
import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './types'

/**
 * Pickpocket power implementation - steals items from monsters
 */
export class PickpocketPower extends ItemPower {
  readonly displayName = "Pickpocket";
  readonly icon = "👝";
  readonly glowColor = "rgba(139, 69, 19, 0.8)";

  applyToMonster(item: Item, monsterId: string): PowerResult {
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success ? `${item.name} stole an item from the monster!` : `${item.name} failed to steal from the monster.`
    };
  }

  applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to pickpocket all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} stole items from all ${type}s!`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to pickpocket monster ${monsterId}`);
    
    // In real implementation:
    // 1. Find the monster with the given ID
    // 2. Check if it has an item
    // 3. If it does, steal the item and add it to the player's inventory
    
    // For now, we'll just return success
    return true;
  }
} 
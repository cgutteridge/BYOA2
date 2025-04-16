import type { Item } from '../types'
import type { Monster, Pub, MonsterTypeId, ItemPowerId } from '../types'

// Base abstract class for all power implementations
export abstract class ItemPower {
  static displayName: string = 'Unknown Power';
  static icon: string = '?';
  static glowColor: string = 'rgba(255, 255, 255, 0.8)';

  // Target selection methods
  static targetTypes(item: Item): string[] {
    return item.targetFilters?.species || [];
  }

  static targetMonsters(item: Item, monsters: Monster[]): Monster[] {
    return monsters.filter(monster => {
      // Only include alive monsters
      if (!monster.alive) return false;
      
      // Check if monster matches the filters
      if (item.targetFilters) {
        // Filter by species if specified
        if (item.targetFilters.species?.length && !item.targetFilters.species.includes(monster.type as any)) {
          return false;
        }
      }
      
      return true;
    });
  }

  static targetLocations(_item: Item, _locations: Pub[]): Pub[] {
    return [];
  }

  static hasInputs(_item: Item): { target: boolean; result: boolean } {
    return { target: true, result: false };
  }

  // Execution methods
  static reduceUses(item: Item): void {
    if (item.uses > 0) {
      item.uses--;
    }
  }

  // These methods will be used by child classes
  static useOnType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} on all monsters of type ${type}`);
    
    this.reduceUses(item);
    
    // Call the implementation-specific apply method
    return this.applyToType(item, type);
  }

  static useOnMonster(item: Item, monsterId: string): PowerResult {
    console.log(`Using ${item.name} on monster ${monsterId}`);
    
    this.reduceUses(item);
    
    // Call the implementation-specific apply method
    return this.applyToMonster(item, monsterId);
  }

  // Abstract methods to be implemented by child classes
  static applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} on all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} affected all ${type}s!`
    };
  }

  static applyToMonster(item: Item, monsterId: string): PowerResult {
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    // Generate a generic message based on success
    return {
      success,
      message: success 
        ? `${item.name} was used successfully on the monster!`
        : `${item.name} failed to affect the monster.`
    };
  }

  // Abstract method to apply the power's effect to a monster
  // Returns true if the effect was successfully applied, false otherwise
  static applyEffect(_item: Item, _monsterId: string): boolean {
    return false; // Default implementation returns failure
  }

  static applyToLocation(_item: Item, _locationId: string): PowerResult {
    return {
      success: false,
      message: 'Not implemented'
    };
  }
}

// Power factory to provide UI properties and functionality
export interface PowerFactory {
  getPower: (powerName: ItemPowerId) => typeof ItemPower | undefined;
  getIcon: (powerName: ItemPowerId) => string;
  getGlowColor: (powerName: ItemPowerId) => string;
  getDisplayName: (powerName: ItemPowerId) => string;
}

// Result type for power executions
export interface PowerResult {
  success: boolean;
  message: string;
  targets?: Monster[] | Pub[] | string[];
  affectedItems?: Item[];
} 
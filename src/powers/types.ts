import type { Item } from '../types'
import type { Monster, Pub, MonsterTypeId, ItemPowerId, MonsterFlag, MonsterLevel, TargetMode } from '../types'
import { monsterTypes } from '../data/monsterTypes'

// Power constants interface for item generation
export interface PowerConstants {
  // Base cost in points when generating items
  readonly baseCost: number;
  
  // Whether the power can have target restrictions (species/flags)
  readonly canHaveTargetRestriction: boolean;
  
  // Whether the power supports targeting all monsters of a type
  readonly supportsTypeTargeting: boolean;
  
  // Default target mode when generating items
  readonly defaultTargetMode: TargetMode;
  
  // Whether the power can have result restrictions (for transmutation)
  readonly canHaveResultRestriction: boolean;
  
  // Level restrictions - which monster levels this power works on
  readonly levelRestrictions: MonsterLevel[] | null;
}

// Base abstract class for all power implementations
export abstract class ItemPower {
  readonly displayName: string = 'Unknown Power';
  readonly icon: string = '?';
  readonly glowColor: string = 'rgba(255, 255, 255, 0.8)';
  
  // Power constants for item generation
  abstract readonly constants: PowerConstants;

  // Target selection methods
  targetTypes(item: Item): string[] {
    return item.targetFilters?.species || [];
  }

  /**
   * Filter monsters based on item's target filters
   */
  targetMonsters(item: Item, monsters: Monster[]): Monster[] {
    return monsters.filter(monster => this.canTargetMonster(item, monster));
  }

  targetLocations(_item: Item, _locations: Pub[]): Pub[] {
    return [];
  }

  hasInputs(_item: Item): { target: boolean; result: boolean } {
    return { target: true, result: false };
  }

  // Execution methods
  protected reduceUses(item: Item): void {
    if (item.uses > 0) {
      item.uses--;
    }
  }

  // These methods will be used by child classes
  useOnType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} on all monsters of type ${type}`);
    
    this.reduceUses(item);
    
    // Call the implementation-specific apply method
    return this.applyToType(item, type);
  }

  useOnMonster(item: Item, monsterId: string): PowerResult {
    console.log(`Using ${item.name} on monster ${monsterId}`);
    
    this.reduceUses(item);
    
    // Call the implementation-specific apply method
    return this.applyToMonster(item, monsterId);
  }

  // Implementation methods to be overridden by child classes
  applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} on all monsters of type ${type}`);
    
    return {
      success: true,
      message: `${item.name} affected all ${type}s!`
    };
  }

  applyToMonster(item: Item, monsterId: string): PowerResult {
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
  abstract applyEffect(item: Item, monsterId: string): boolean;

  applyToLocation(_item: Item, _locationId: string): PowerResult {
    return {
      success: false,
      message: 'Not implemented'
    };
  }

  /**
   * Checks if a monster meets the targeting criteria for an item
   */
  canTargetMonster(item: Item, monster: Monster): boolean {
    // Check if monster is alive
    if (!monster.alive) {
      return false;
    }
    
    // Find the monster type definition
    const monsterType = monsterTypes.find(mt => mt.id === monster.type);
    if (!monsterType) {
      return false;
    }
    
    // Handle power-specific targeting restrictions in subclasses
    if (!this.canTargetMonsterType(monsterType)) {
      return false;
    }
    
    // Check target filters from the item
    if (item.targetFilters) {
      // Check level restrictions
      if (item.targetFilters.levels && item.targetFilters.levels.length > 0) {
        if (!item.targetFilters.levels.includes(monsterType.level)) {
          return false;
        }
      }
      
      // Check species restrictions
      if (item.targetFilters.species && item.targetFilters.species.length > 0) {
        if (!item.targetFilters.species.includes(monsterType.species)) {
          return false;
        }
      }
      
      // Check flag restrictions
      if (item.targetFilters.flags && item.targetFilters.flags.length > 0) {
        const hasValidFlag = monsterType.flags.some((flag: MonsterFlag) => 
          item.targetFilters?.flags?.includes(flag)
        );
        if (!hasValidFlag) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Power-specific logic for targeting monster types
   * Override in subclasses for special targeting restrictions
   */
  protected canTargetMonsterType(monsterType: any): boolean {
    return true;
  }

  /**
   * Get all valid monster types that can be targeted
   */
  getValidMonsterTypes(item: Item, monsters: Monster[]): string[] {
    if (!monsters || !monsters.length) {
      return [];
    }
    
    // Get all valid monsters first
    const validMonsters = this.targetMonsters(item, monsters);
    
    // Extract unique monster types
    const validTypes = new Set<string>();
    
    validMonsters.forEach(monster => {
      validTypes.add(monster.type);
    });
    
    return Array.from(validTypes);
  }

  /**
   * Get a human-readable description of an item's targeting mode
   */
  getTargetingDescription(item: Item): string {
    if (!item.target) {
      return "Targets a random monster";
    }

    switch (item.target) {
      case 'random':
        return "Targets a random monster";
      case 'pick':
        return "Choose a monster to target";
      case 'random_type':
        return "Targets all monsters of a random type";
      case 'pick_type':
        return "Choose a monster type to target";
      case 'location':
        return "Targets the current location";
      default:
        return "Unknown targeting mode";
    }
  }
}

// Power factory to provide UI properties and functionality
export interface PowerFactory {
  getPower: (powerName: ItemPowerId) => ItemPower | undefined;
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
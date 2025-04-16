import type { Item, ItemPower as ItemPowerType } from '../types'
import type { Monster, Pub, Location } from '../types'

// Base abstract class for all power implementations
export abstract class ItemPower {
  static displayName: string = 'Unknown Power';
  static icon: string = '?';
  static glowColor: string = 'rgba(255, 255, 255, 0.8)';

  // Target selection methods
  static targetTypes(item: Item): string[] {
    return [];
  }

  static targetMonsters(item: Item, monsters: Monster[]): Monster[] {
    return [];
  }

  static targetLocations(item: Item, locations: Pub[]): Pub[] {
    return [];
  }

  static hasInputs(item: Item): { target: boolean; result: boolean } {
    return { target: false, result: false };
  }

  // Execution methods
  static reduceUses(item: Item): void {
    if (item.uses > 0) {
      item.uses--;
    }
  }

  static applyToType(item: Item, type: string): PowerResult {
    return {
      success: false,
      message: 'Not implemented'
    };
  }

  static applyToMonster(item: Item, monsterId: string): PowerResult {
    return {
      success: false,
      message: 'Not implemented'
    };
  }

  static applyToLocation(item: Item, locationId: string): PowerResult {
    return {
      success: false,
      message: 'Not implemented'
    };
  }
}

// Power factory to provide UI properties and functionality
export interface PowerFactory {
  getPower: (powerName: string) => typeof ItemPower | undefined;
  getIcon: (powerName: string) => string;
  getGlowColor: (powerName: string) => string;
  getDisplayName: (powerName: string) => string;
}

// Result type for power executions
export interface PowerResult {
  success: boolean;
  message: string;
  targets?: Monster[] | Pub[] | string[];
  affectedItems?: Item[];
} 
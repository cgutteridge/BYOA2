import type { Item } from '../types'
import type { Monster, Pub } from '../types'

// Base abstract class for all power implementations
export abstract class ItemPower {
  static displayName: string = 'Unknown Power';
  static icon: string = '?';
  static glowColor: string = 'rgba(255, 255, 255, 0.8)';

  // Target selection methods
  static targetTypes(_item: Item): string[] {
    return [];
  }

  static targetMonsters(_item: Item, _monsters: Monster[]): Monster[] {
    return [];
  }

  static targetLocations(_item: Item, _locations: Pub[]): Pub[] {
    return [];
  }

  static hasInputs(_item: Item): { target: boolean; result: boolean } {
    return { target: false, result: false };
  }

  // Execution methods
  static reduceUses(item: Item): void {
    if (item.uses > 0) {
      item.uses--;
    }
  }

  static applyToType(_item: Item, _type: string): PowerResult {
    return {
      success: false,
      message: 'Not implemented'
    };
  }

  static applyToMonster(_item: Item, _monsterId: string): PowerResult {
    return {
      success: false,
      message: 'Not implemented'
    };
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
import type {Item, Monster  } from '../types'
import { ItemPower } from './abstractItemPower'

/**
 * Transmute power implementation
 */
export class TransmutePower extends ItemPower {
  // UI properties
  readonly displayName = "Transmute";
  readonly icon = "🔄";
  readonly glowColor = "rgba(138, 43, 226, 0.8)";
  
  // Item generation constants
  readonly baseCost = 1;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = true;
  readonly levelRestrictions = null;

  applyEffect(_item: Item, _monster: Monster): boolean {
    return false;
  } // Can target any level

} 
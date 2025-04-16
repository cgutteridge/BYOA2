import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './abstractItemPower'

/**
 * Transmute power implementation
 */
export class TransmutePower extends ItemPower {
  // UI properties
  readonly displayName = "Transmute";
  readonly icon = "🔄";
  readonly glowColor = "rgba(138, 43, 226, 0.8)";
  
  // Item generation constants
  readonly baseCost = 3;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = true;
  readonly levelRestrictions = null; // Can target any level

} 
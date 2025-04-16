import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './abstractItemPower'

/**
 * Spy power implementation
 */
export class SpyPower extends ItemPower {
  // UI properties
  readonly displayName = "Spy";
  readonly icon = "👁️";
  readonly glowColor = "rgba(0, 128, 128, 0.8)";
  
  // Item generation constants
  readonly baseCost = 1;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions = null; // Can target any level

} 
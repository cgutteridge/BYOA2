import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './abstractItemPower'

/**
 * Split power implementation
 */
export class SplitPower extends ItemPower {
  // UI properties
  readonly displayName = "Split";
  readonly icon = "✂️";
  readonly glowColor = "rgba(255, 165, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 3;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions = null; // Can target any level


} 
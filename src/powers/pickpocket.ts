import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './abstractItemPower'

/**
 * Pickpocket power implementation
 */
export class PickpocketPower extends ItemPower {
  // UI properties
  readonly displayName = "Pickpocket";
  readonly icon = "🧤";
  readonly glowColor = "rgba(255, 215, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 2;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions = null; // Can target any level

} 
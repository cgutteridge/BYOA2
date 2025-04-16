import type { Item, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './abstractItemPower'

/**
 * Banish power implementation - removes monsters from the location
 */
export class BanishPower extends ItemPower {
  // UI properties
  readonly displayName = "Banish";
  readonly icon = "🪄";
  readonly glowColor = "rgba(255, 20, 147, 0.8)"; // Deep pink
  
  // Item generation constants
  readonly baseCost = 1;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions = null; // Can target any level

} 
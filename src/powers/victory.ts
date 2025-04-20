import type {Item, Monster} from '../types'
import {ItemPower} from './abstractItemPower';

/**
 * Victory power implementation - quest completion item
 */
export class VictoryPower extends ItemPower {
  // UI properties
  readonly displayName = "Victory";
  readonly icon = "🏆";
  readonly glowColor = "rgba(255, 215, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 100;
  readonly canHaveTargetRestriction = false;
  readonly supportsTypeTargeting = false;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = null; // Can target any level

  applyEffect(_item: Item, _monster: Monster): boolean {
    return false;
  }
  
  generateEffectDescription(_item: Item): string {
    return 'This is the thing you\'ve been after. Well done. YOU WIN!';
  }
} 
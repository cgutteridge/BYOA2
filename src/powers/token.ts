import type {Item, Monster} from '../types'
import {ItemPower} from './abstractItemPower';

/**
 * Token power implementation - quest completion item
 */
export class TokenPower extends ItemPower {
  // UI properties
  readonly displayName = "Token";
  readonly icon = "🎟️";
  readonly glowColor = "rgba(255, 215, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 100;
  readonly canHaveTargetRestriction = false;
  readonly supportsTypeTargeting = false;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = null; // Can target any level

  readonly itemTargetType = 'none';

  // Item types for this power
  readonly itemArtifactNames = ["Token", "Pass", "Ticket"];

  applyEffect(_item: Item, _monster: Monster): boolean {
    return false;
  }

  generateEffectDescription(_item: Item): string {
    return 'This is required to complete the quest.';
  }
} 
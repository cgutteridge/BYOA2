import {ItemPower} from './abstractItemPower';

/**
 * Quest token power implementation
 */
export class TokenPower extends ItemPower {
  // UI properties
  readonly displayName = "Quest Token";
  readonly icon = "⭐️";
  readonly glowColor = "rgba(255, 0, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 2;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly maxLevel = null; // Can target any level

} 
import {ItemPower} from './abstractItemPower';

/**
 * Kill power implementation
 */
export class VictoryPower extends ItemPower {
  // UI properties
  readonly displayName = "Victory";
  readonly icon = "🥇️";
  readonly glowColor = "rgba(255, 0, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 10;
  readonly canHaveTargetRestriction = false;
  readonly supportsTypeTargeting = false;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = null; // Can target any level

} 
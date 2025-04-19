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
  readonly baseCost = 2;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions = null; // Can target any level

} 
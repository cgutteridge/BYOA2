import type {Item, Monster} from '../types';
import {ItemPower} from './abstractItemPower';

/**
 * Kill power implementation
 */
export class KillPower extends ItemPower {
  // UI properties
  readonly displayName = "Kill";
  readonly icon = "⚔️";
  readonly glowColor = "rgba(255, 0, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 2;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions = null; // Can target any level

  // @ts-ignore
  applyEffect(item: Item, monster: Monster): boolean {
    if (monster && monster.alive) {
      monster.alive = false;
      return true;
    }
    return false;
  }
} 
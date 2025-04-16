import { ItemPower } from './abstractItemPower'
import {Item, Monster} from "@/types";

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
  readonly levelRestrictions = null;

  applyEffect(_item: Item, _monster: Monster): boolean {
    return false;
  } // Can target any level

} 
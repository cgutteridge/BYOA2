import { ItemPower } from './abstractItemPower'
import {Item, Monster} from "@/types";
import {useQuestStore} from "@/stores/questStore.ts";

/**
 * Spy power implementation
 */
export class SpyPower extends ItemPower {
  // UI properties
  readonly displayName = "Spy";
  readonly icon = "👁️";
  readonly glowColor = "rgba(0, 128, 128, 0.8)";
  
  // Item generation constants
  readonly baseCost = 1;
  readonly canHaveTargetRestriction = false;
  readonly supportsTypeTargeting = false;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = null; // Can target any level

  applyEffect(_item: Item, _monster: Monster): boolean {
    const questStore = useQuestStore();

    // Log the banishment
    questStore.updateStats(1,0,0,
        `todo`)

    return false;
  } // Can target any level

} 
import { ItemPower } from './abstractItemPower'
import {Item, Monster} from "@/types";
import {useQuestStore} from "@/stores/questStore.ts";

/**
 * Pickpocket power implementation
 */
export class PickpocketPower extends ItemPower {
  // UI properties
  readonly displayName = "Pickpocket";
  readonly icon = "🧤";
  readonly glowColor = "rgba(255, 215, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 1;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly maxLevel = null; // Can target any level

  applyEffect(item: Item, monster: Monster): boolean {
    const questStore = useQuestStore();

    // Log the banishment
    questStore.updateStats(1,0,0,
        `${monster.name} was robbed with ${item.name}`)

    return false;
  }

} 
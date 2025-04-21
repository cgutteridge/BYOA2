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
  readonly glowColor = "rgba(0, 100, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 1;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = 'grunt'; // Max level this works on

  readonly itemTargetType = 'monsters';

  // Item types for this power
  readonly itemArtifactNames = ["Gloves", "Lockpick", "Hook", "Claw", "Hand", "Grasp", "Grip", "Thief's Tool"];

  applyEffect(item: Item, monster: Monster): boolean {
    const questStore = useQuestStore();

    // Log the banishment
    questStore.updateStats(1,0,0,
        `${monster.name} was robbed with ${item.name}`)

    return false;
  }

  generateEffectDescription(item: Item): string {
    const qualityTerm = this.getLevelQualityTerm(item.level);
    return `This ${qualityTerm} item steals from ${this.getTargetDescription(item)}.`;
  }
} 
import type {Item, Monster  } from '../types'
import { ItemPower } from './abstractItemPower'
import {useQuestStore} from "@/stores/questStore.ts";

/**
 * Transmute power implementation
 */
export class TransmutePower extends ItemPower {
  // UI properties
  readonly displayName = "Transmute";
  readonly icon = "🔄";
  readonly glowColor = "rgba(138, 43, 226, 0.8)";
  
  // Item generation constants
  readonly baseCost = 2;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly canHaveResultRestriction = true;
  readonly maxLevel = null; // Can target any level

  readonly itemTargetType = 'monsters';
  readonly maxTargets = 1;
  readonly hasResults = true;

  // Item types for this power
  readonly itemArtifactNames = ["Amulet", "Ring", "Medallion", "Talisman", "Charm", "Jewel", "Orb"];

  applyEffect(item: Item, monster: Monster): boolean {
    const questStore = useQuestStore();

    // Log the banishment
    questStore.updateStats(1,0,0,
        `${monster.name} was transmuted TODO with ${item.name}`)

    return false;
  }

  generateEffectDescription(item: Item): string {
    const qualityTerm = this.getLevelQualityTerm(item.level);
    return `This ${qualityTerm} item transforms ${this.getTargetDescription(item)} into ${this.getResultDescription(item)}.`;
  }
} 
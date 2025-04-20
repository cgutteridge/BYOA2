import type {Item, Monster} from '../types'
import { ItemPower } from './abstractItemPower'
import {useQuestStore} from "@/stores/questStore.ts";

/**
 * Spy power implementation
 */
export class SpyPower extends ItemPower {
  // UI properties
  readonly displayName = "Spy";
  readonly icon = "🔍";
  readonly glowColor = "rgba(65, 105, 225, 0.8)";
  
  // Item generation constants
  readonly baseCost = 2;
  readonly canHaveTargetRestriction = false;
  readonly supportsTypeTargeting = false;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = null; // Can target any level

  applyEffect(item: Item, monster: Monster): boolean {
    const questStore = useQuestStore();

    questStore.updateStats(0,0,0, 
        `Used ${item.name} to spy TODO`)
    
    return false;
  }

  generateEffectDescription(item: Item): string {
    const qualityTerm = this.getLevelQualityTerm(item.level);
    return `This ${qualityTerm} item reveals any location without visiting it.`;
  }
} 
import type {Item, Monster} from '../types';
import {ItemPower} from './abstractItemPower';
import {useQuestStore} from "@/stores/questStore.ts";

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
  readonly maxLevel = null; // Can target any level

  // @ts-ignore
  applyEffect(item: Item, monster: Monster): boolean {
    const questStore = useQuestStore();

    if (!monster || !monster.alive) {
      return false;
    }

    monster.alive = false;

    // Log the banishment
    questStore.updateStats(1,0,0,
        `${monster.name} was destroyed with ${item.name}`)

    return true;
  }
} 
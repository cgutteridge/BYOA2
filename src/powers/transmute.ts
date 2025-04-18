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
  readonly baseCost = 1;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = true;
  readonly levelRestrictions = null;

  applyEffect(item: Item, monster: Monster): boolean {
    const questStore = useQuestStore();

    // Log the banishment
    questStore.updateStats(1,0,0,
        `${monster.name} was transmuted TODO with ${item.name}`)

    return false;
  } // Can target any level

} 
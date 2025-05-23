import type {Item, Monster} from '../types'
import {ItemPower} from './abstractItemPower'
import {useQuestStore} from '@/stores/questStore.ts'

/**
 * Banish power implementation
 */
export class BanishPower extends ItemPower {
  // UI properties
  readonly displayName = "Banish";
  readonly icon = "🪄";
  readonly glowColor = "rgba(255, 20, 147, 0.8)"; // Deep pink
  
  // Item generation constants
  readonly baseCost = 1;
  readonly generateWeight = 12;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = null; // Can target any level

  readonly itemTargetType = 'monsters';

  // Item types for this power
  readonly itemArtifactNames = ["Bell", "Book", "Candle", "Scroll", "Rune", "Sigil", "Seal", "Symbol"];

  applyEffect(item: Item, monster: Monster): boolean {
    // Guard: check if monster exists and is alive
    if (!monster || !monster.alive) {
      return false;
    }

    // Get the quest store to access the current location
    const questStore = useQuestStore();
    const currentGameLocation = questStore.currentGameLocation;

    // Guard: check if current location exists and has monsters
    if (!currentGameLocation || !currentGameLocation.monsters) {
      console.warn('Cannot banish monster: no current location found');
      return false;
    }

    // Find the monster in the current location
    const monsterIndex = currentGameLocation.monsters.findIndex((m: Monster) => m.id === monster.id);
    
    // Guard: check if monster was found
    if (monsterIndex === -1) {
      console.warn(`Could not find monster ${monster.name} in the current location.`);
      return false;
    }

    // Remove the monster from the location
    currentGameLocation.monsters.splice(monsterIndex, 1);

    // Log the banishment
    questStore.logAndNotifyQuestEvent(
        `${monster.name} was banished with ${item.name}`, { xp: 1 }
    )

    return true;
  }

  generateEffectDescription(item: Item): string {
    return `Banish ${this.getTargetDescription(item)}.`;
  }
} 
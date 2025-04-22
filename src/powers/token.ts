import type {Item, Monster} from '../types'
import {ItemPower} from './abstractItemPower';
import {useInventoryStore} from '@/stores/inventoryStore';
import {useQuestStore} from '@/stores/questStore';

/**
 * Token power implementation - quest completion item
 */
export class TokenPower extends ItemPower {
  // UI properties
  readonly displayName = "Token";
  readonly icon = "🎟️";
  readonly glowColor = "rgba(255, 215, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 100;
  readonly canHaveTargetRestriction = false;
  readonly supportsTypeTargeting = false;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = null; // Can target any level

  readonly itemTargetType = 'none';

  // Item types for this power
  readonly itemArtifactNames = ["Token", "Pass", "Ticket"];

  applyEffect(_item: Item, _monster: Monster): boolean {
    return false;
  }

  generateEffectDescription(_item: Item): string {
    const inventoryStore = useInventoryStore();
    const questStore = useQuestStore();
    const minimumLocations = questStore.minimumLocations;
    const tokenTitle = questStore.tokenTitle;
    const endLocationName = questStore.endGameLocation?.name || 'the final location';
    const currentTokens = inventoryStore.tokenCount;
    
    if (currentTokens >= minimumLocations) {
      return `You have all the ${tokenTitle} required to enter ${endLocationName}.`;
    } else {
      return `You have ${currentTokens||'none'} of the required ${minimumLocations} ${tokenTitle} to enter ${endLocationName}.`;
    }
  }
} 
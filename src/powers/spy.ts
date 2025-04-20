import type { Item, Monster } from '../types'
import { ItemPower } from './abstractItemPower'

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
  
  // Item types for this power
  readonly itemTypes = ["Eyeglass", "Looking Glass", "Lens", "Scope", "Mirror", "Spyglass", "Crystal Ball"];

  generateEffectDescription(item: Item): string {
    const qualityTerm = this.getLevelQualityTerm(item.level);
    return `This ${qualityTerm} item reveals any location without visiting it.`;
  }

  applyEffect(_item: Item, _monster: Monster): boolean {
    // Implementation of applyEffect method
    return false; // Placeholder return, actual implementation needed
  }
} 
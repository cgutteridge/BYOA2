import type { Item, GameLocation } from '../types'
import { ItemPower } from './abstractItemPower'
import { scoutLocation } from '@/quest/scoutLocation.ts'
import { useAppStore } from '@/stores/appStore.ts'

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

  readonly itemTargetType = 'locations';

  // Item types for this power
  readonly itemArtifactNames = ["Eyeglass", "Looking Glass", "Lens", "Scope", "Mirror", "Spyglass", "Crystal Ball"];

  generateEffectDescription(item: Item): string {
    const qualityTerm = this.getLevelQualityTerm(item.level);
    return `This ${qualityTerm} item reveals any location without visiting it.`;
  }

  // Override the location targeting to only allow non-scouted locations
  canTargetLocation(_item: Item, location: GameLocation): boolean {
    // Only allow targeting locations that have not been scouted yet
    return !location.scouted;
  }

  // Use the spy item on a location
  useOnLocation(item: Item, location: GameLocation): boolean {
    if (!this.canTargetLocation(item, location)) {
      return false;
    }

    // Scout the location asynchronously without blocking
    scoutLocation(location)
      .then(() => {
        // Show a notification about successful scouting
        const appStore = useAppStore();
        appStore.addNotification('Location scouted successfully');
      })
      .catch(error => {
        console.error('Error scouting location:', error);
      });

    return true;
  }
} 
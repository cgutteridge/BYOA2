import type {GameLocation, Item} from '../types'
import {ItemPower} from './abstractItemPower'
import {scoutLocation} from '@/quest/scoutLocation.ts'
import {useQuestStore} from '@/stores/questStore.ts'

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

  // Override canTargetLocation to only allow un-scouted locations
  canTargetLocation(_item: Item, location: GameLocation): boolean {
    // Only allow targeting locations that have not been scouted yet
    return !location.scouted;
  }

  // Use the spy item on a location
  useOnLocation(item: Item, location: GameLocation): boolean {
    if (!this.canTargetLocation(item, location)) {
      return false;
    }

    const questStore = useQuestStore();
    questStore.logAndNotifyQuestEvent(3, 0, 0,
        `Used ${item.name} to scope out ${location.name} from a distance.`);

    // Scout the location asynchronously without blocking
    scoutLocation(location)
        .then()
      .catch(error => {
        console.error('Error scouting location:', error);
      });

    // Reduce item uses
    this.reduceUses(item);
    
    return true;
  }
} 
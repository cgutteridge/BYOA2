import type { Item, GameLocation } from '../types'
import { ItemPower } from './abstractItemPower'
import { scoutLocation } from '@/quest/scoutLocation.ts'
import { useAppStore } from '@/stores/appStore.ts'
import { useQuestStore } from '@/stores/questStore.ts'

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

  // Override filterLocationTargetsForItem to only return unscouted locations
  filterLocationTargetsForItem(item: Item, locations: GameLocation[]): GameLocation[] {
    // Filter to only return unscouted locations
    return locations.filter(location => !location.scouted);
  }

  // Use the spy item on a location
  useOnLocation(item: Item, location: GameLocation): boolean {
    if (location.scouted) {
      return false;
    }

    const questStore = useQuestStore();
    const appStore = useAppStore();

    // Scout the location asynchronously without blocking
    scoutLocation(location)
      .then(() => {
        // Show a notification about successful scouting
        appStore.addNotification(`Scouted ${location.name} successfully`);
        
        // Log the successful use in stats
        questStore.updateStats(1, 0, 0, 
          `Used ${item.name} to scout ${location.name} from a distance.`);
      })
      .catch(error => {
        console.error('Error scouting location:', error);
      });

    // Reduce item uses
    this.reduceUses(item);
    
    return true;
  }
} 
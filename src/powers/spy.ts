import type {GameLocation, Item} from '../types'
import {ItemPower} from './abstractItemPower'
import {scoutLocation} from '@/quest/scoutLocation.ts'
import {useQuestStore} from '@/stores/questStore.ts'
import {useAppStore} from '@/stores/appStore.ts'
import calculateDistance from '@/utils/calculateDistance.ts'
import {useLocationStore} from '@/stores/locationStore.ts'

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
  readonly generateWeight = 12;
  readonly canHaveTargetRestriction = false;
  readonly supportsTypeTargeting = false;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = null; // Can target any level

  readonly itemTargetType = 'locations';

  // Item types for this power
  readonly itemArtifactNames = ["Eyeglass", "Looking Glass", "Lens", "Scope", "Mirror", "Spyglass", "Crystal Ball"];

  generateEffectDescription(_item: Item): string {
    return `Reveals any location without visiting it.`;
  }

  // Override canTargetLocation to only allow un-scouted locations
  canTargetLocation(_item: Item, location: GameLocation): boolean {
    const appStore = useAppStore();
    const questStore = useQuestStore();
    
    // Only allow targeting locations that have not been scouted yet
    if (location.scouted) {
      return false;
    }
    
    // Filter out locations within scout range
    if (appStore.playerCoordinates) {
      const distance = calculateDistance(appStore.playerCoordinates, location.coordinates);
      if (distance <= questStore.scoutRange) {
        return false;
      }
    }
    
    return true;
  }

  // Override filterLocationTargetsForItem to ensure we get valid targets for both random and pick modes
  filterLocationTargetsForItem(item: Item, locations: GameLocation[]): GameLocation[] {
    console.log(`filterLocationTargetsForItem: Filtering ${locations.length} locations`);
    // Filter locations to just the unscouted ones outside of scout range
    const filtered = locations.filter(location => this.canTargetLocation(item, location));
    console.log(`filterLocationTargetsForItem: Found ${filtered.length} valid targets`);
    return filtered;
  }

  // Use the spy item on a location
  useOnLocation(item: Item, location: GameLocation): boolean {
    if (!this.canTargetLocation(item, location)) {
      return false;
    }

    const questStore = useQuestStore();
    questStore.logAndNotifyQuestEvent(
        `Used ${item.name} to scope out ${location.name} from a distance.`,
        { xp: 3 }
    );

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
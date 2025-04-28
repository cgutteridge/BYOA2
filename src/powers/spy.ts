import type {GameLocation, Item, Monster, MonsterType} from '../types'
import {ItemPower} from './abstractItemPower'
import {scoutLocation} from '@/quest/scoutLocation.ts'
import {useQuestStore} from '@/stores/questStore.ts'
import {useAppStore} from '@/stores/appStore.ts'
import calculateDistance from '@/utils/calculateDistance.ts'

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

  readonly afterUse = (_item:Item,target?:GameLocation|Monster|MonsterType)=>{
    const appStore = useAppStore()
    appStore.closeInterface()
    if( target ) {
      console.log((target as GameLocation).coordinates)
      appStore.setMapPosition((target as GameLocation).coordinates)
    }
  }


  generateEffectDescription(_item: Item): string {
    return `Reveals a location without visiting it.`;
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
    // Filter locations to just the unscouted ones outside of scout range
    const filtered = locations.filter(location => this.canTargetLocation(item, location));

    // For random target mode, limit to 10 nearest locations
    if (item.target === 'random') {
      const appStore = useAppStore();
      
      if (appStore.playerCoordinates) {
        // Add distance info to each location
        const locationsWithDistance = filtered.map(location => {
          const distance = calculateDistance(appStore.playerCoordinates!, location.coordinates);
          return { location, distance };
        });
        
        // Sort by distance (closest first) and take the first 10
        const nearest = locationsWithDistance
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10)
          .map(item => item.location);
          
        return nearest;
      }
    }
    
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
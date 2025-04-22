import type {Item, Monster, MonsterType} from '../types'
import { ItemPower } from './abstractItemPower'
import {useQuestStore} from "@/stores/questStore.ts";
import {useAppStore} from "@/stores/appStore.ts";
import {monsterTypes, monsterTypesById} from "@/data/monsterTypes.ts";
import pickOne from "@/utils/pickOne.ts";

/**
 * Transmute power implementation
 */
export class TransmutePower extends ItemPower {
  // UI properties
  readonly displayName = "Transmute";
  readonly icon = "🔄";
  readonly glowColor = "rgba(138, 43, 226, 0.8)";
  
  // Item generation constants
  readonly baseCost = 2;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly canHaveResultRestriction = true;
  readonly maxLevel = null; // Can target any level

  readonly itemTargetType = 'monsters';
  readonly maxTargets = 1;
  readonly hasResults = true;

  // Item types for this power
  readonly itemArtifactNames = ["Amulet", "Ring", "Medallion", "Talisman", "Charm", "Jewel", "Orb"];

  /**
   * Get possible result monster types for the selected monster
   * Returns all monster types of the same level
   */
  getPossibleResults(item: Item, monsterType: MonsterType): MonsterType[] {
    // Filter monster types to only include those of the same level
    const sameLevel = monsterTypes.filter(type => type.level === monsterType.level);

    // Apply result restrictions if they exist
    if (item.resultSpecies) {
      return sameLevel.filter(type => {
        // Check species restrictions
        if (item.resultSpecies) {
          if (type.species !== item.resultSpecies) {
            return false;
          }
        }

        return true;
      });
    }

    return sameLevel;
  }

  applyEffect(item: Item, monster: Monster, resultMonsterType?: MonsterType): boolean {
    const questStore = useQuestStore();
    const appStore = useAppStore();

    // If no result type specified and it's a random result
    if (!resultMonsterType) {
      // Get possible results for this monster
      const monsterType = monsterTypesById[monster.type];
      if (!monsterType) return false;
      
      const possibleResults = this.getPossibleResults(item, monsterType);
      
      // If no valid results, we can't transform
      if (possibleResults.length === 0) {
        appStore.addNotification("The transmutation failed - no valid forms available!");
        return false;
      }
      
      // Random selection from possible results
      resultMonsterType = pickOne(possibleResults);
    }
    
    // Store the original monster name for logging
    const originalName = monster.name;
    
    // Perform the transmutation
    monster.type = resultMonsterType.id;
    
    // Generate a new name based on the new monster type
    const prefix = monster.name.split(' ')[0]; // Keep the first part of the name
    monster.name = `${prefix} ${resultMonsterType.title}`; 
    
    // Log the transmutation
    questStore.updateStats(3, 0, 0,
        `${originalName} was transmuted into ${monster.name} with ${item.name}`);
    
    // Notify the user
    appStore.addNotification(`${originalName} transformed into ${monster.name}!`);

    return true;
  }

  generateEffectDescription(item: Item): string {
    const qualityTerm = this.getLevelQualityTerm(item.level);
    
    let resultDescription = "another creature of the same level";
    
    // If we have a specific result species, include it in the description
    if (item.resultSpecies) {
      resultDescription = `another ${item.resultSpecies} of the same level`;
    } 
    // Use the result description from base class if available
    else if (this.getResultDescription(item)) {
      resultDescription = this.getResultDescription(item);
    }
    
    return `This ${qualityTerm} item transforms ${this.getTargetDescription(item)} into ${resultDescription}.`;
  }
} 
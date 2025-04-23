import type { Item, MonsterTypeId, Monster, MonsterLevel } from '../types'
import { ItemPower } from './abstractItemPower'
import { monsterTypes } from '../data/monsterTypes'
import { toMonsterTypeId } from '../types'
import {useQuestStore} from "@/stores/questStore.ts";

/**
 * Vegetate power implementation - transforms monsters into plant-like versions
 * Turns any enemy into a vegetated monster of the same level
 * Will not work on bosses
 */
export class VegetatePower extends ItemPower {
  // UI properties
  readonly displayName = "Vegetate";
  readonly icon = "🥦";
  readonly glowColor = "rgba(0, 127, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 1;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = 'elite'; // Can target up to elite monsters

  readonly itemTargetType = 'monsters';

  // Item types for this power
  readonly itemArtifactNames = ["Magic Seed", "Green Elixir", "Plant Potion", "Verdant Crystal"];

  // Map from level to appropriate plant monster
  private readonly plantMonsterMap: Record<MonsterLevel, MonsterTypeId> = {
    'minion': toMonsterTypeId('veg_minion'),
    'grunt': toMonsterTypeId('veg_grunt'),
    'elite': toMonsterTypeId('veg_elite'),
    'boss': toMonsterTypeId('veg_elite'), // Fallback, but bosses can't be targeted anyway
  };

  applyEffect(item: Item, monster: Monster): boolean {
    const questStore = useQuestStore();

    // Guard: check if monster exists and is alive
    if (!monster || !monster.alive) {
      return false;
    }
    
    // Find the monster type to get its level
    const monsterType = monsterTypes.find(m => m.id === monster.type);
    
    // Guard: check if we found the monster type
    if (!monsterType) {
      console.warn(`Could not find type information for monster ${monster.name}`);
      return false;
    }
    
    // Guard: check if monster is a boss (though we shouldn't be targeting them)
    if (monsterType.level === 'boss') {
      console.warn(`Cannot vegetate boss monster ${monster.name}`);
      return false;
    }
    
    // Get the appropriate vegetated monster for this level
    const vegetatedMonsterTypeId = this.plantMonsterMap[monsterType.level];
    const vegetatedMonsterType = monsterTypes.find(m => m.id === vegetatedMonsterTypeId);
    
    // Guard: check if we found the vegetated monster type
    if (!vegetatedMonsterType) {
      console.warn(`Could not find vegetated monster type for level ${monsterType.level}`);
      return false;
    }
    
    // Transform the monster into a vegetated version
    const originalName = monster.name;
    
    // Update the monster's type and name
    monster.type = vegetatedMonsterTypeId;

    // console.log(`Transformed ${originalName} (${originalType}) into ${monster.name} (${monster.type})`);

    // Log the banishment
    questStore.logAndNotifyQuestEvent(
        `${originalName} was turned to vegetation with ${item.name}`,
        { xp: 1 }
    )

    return true;
  }

  generateEffectDescription(item: Item): string {
    const qualityTerm = this.getLevelQualityTerm(item.level);
    return `This ${qualityTerm} item vegetates ${this.getTargetDescription(item)}.`;
  }
} 

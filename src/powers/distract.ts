import type { Item, MonsterTypeId, Monster, MonsterLevel } from '../types'
import { ItemPower } from './abstractItemPower'
import { monsterTypeById } from '../data/monsterTypesLoader'
import { toMonsterTypeId } from '../types'
import {useQuestStore} from "@/stores/questStore.ts";

/**
 * Distract power implementation - transforms monsters into distracted versions
 * Turns any enemy into a distracted monster of the same level
 * Will not work on bosses
 */
export class DistractPower extends ItemPower {
  // UI properties
  readonly displayName = "Distract";
  readonly icon = "🥤";
  readonly glowColor = "rgba(139, 69, 19, 0.8)";
  
  // Item generation constants
  readonly baseCost = 1;
  readonly generateWeight = 6;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = 'elite'; // Can target up to elite monsters

  readonly itemTargetType = 'monsters';

  // Item types for this power
  readonly itemArtifactNames = ["Cola Bomb", "Fizzing Stone", "Bubble Gem", "Carbonated Crystal", "Sparkling Sphere", "Effervescent Orb"];

  // Map from level to appropriate distracted monster
  private readonly distractedMonsterMap: Record<MonsterLevel, MonsterTypeId> = {
    'minion': toMonsterTypeId('distracted_minion'),
    'grunt': toMonsterTypeId('distracted_grunt'),
    'elite': toMonsterTypeId('distracted_elite'),
    'boss': toMonsterTypeId('distracted_elite'), // Fallback, but bosses can't be targeted anyway
  };

  applyEffect(item: Item, monster: Monster): boolean {
    const questStore = useQuestStore();

    // Guard: check if monster exists and is alive
    if (!monster || !monster.alive) {
      return false;
    }
    
    // Find the monster type to get its level
    const monsterType = monsterTypeById(monster.type);
    
    // Guard: check if monster is a boss (though we shouldn't be targeting them)
    if (monsterType.level === 'boss') {
      console.warn(`Cannot distract boss monster ${monster.name}`);
      return false;
    }
    
    // Get the appropriate distracted monster for this level
    const distractedMonsterTypeId = this.distractedMonsterMap[monsterType.level];

    const originalName = monster.name
    
    // Update the monster's type and name
    monster.type = distractedMonsterTypeId;

    // Log the banishment
    questStore.logAndNotifyQuestEvent(
        `${originalName} was distracted with ${item.name}`,
        { xp: 1 }
    )

    return true;
  }

  generateEffectDescription(item: Item): string {
    return `Distract ${this.getTargetDescription(item)}.`;
  }
} 
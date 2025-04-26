import type { Item, MonsterTypeId, Monster, MonsterLevel } from '../types'
import { ItemPower } from './abstractItemPower'
import { monsterTypeById } from '../data/monsterTypesLoader'
import { toMonsterTypeId } from '../types'
import {useQuestStore} from "@/stores/questStore.ts";

/**
 * Pacify power implementation - transforms monsters into pacified versions
 * Turns any enemy into a pacified, water-based monster of the same level
 * Will not work on bosses
 */
export class PacifyPower extends ItemPower {
  // UI properties
  readonly displayName = "Pacify";
  readonly icon = "💧";
  readonly glowColor = "rgba(0, 119, 190, 0.8)";
  
  // Item generation constants
  readonly baseCost = 1;
  readonly generateWeight = 6;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = 'elite';

  readonly itemTargetType = 'monsters';

  // Item types for this power
  readonly itemArtifactNames = ["Water Vial", "Calming Spray", "Peace Pendant", "Tranquil Mist", "Serene Orb", "Still Water Crystal"];

  // Map from level to appropriate pacified monster
  private readonly pacifiedMonsterMap: Record<MonsterLevel, MonsterTypeId> = {
    'minion': toMonsterTypeId('passive_minion'),
    'grunt': toMonsterTypeId('passive_grunt'),
    'elite': toMonsterTypeId('passive_elite'),
    'boss': toMonsterTypeId('passive_elite'), // Fallback, but bosses can't be targeted anyway
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
      console.warn(`Cannot pacify boss monster ${monster.name}`);
      return false;
    }
    
    // Get the appropriate pacified monster for this level
    const pacifiedMonsterTypeId = this.pacifiedMonsterMap[monsterType.level];
    const pacifiedMonsterType = monsterTypeById(pacifiedMonsterTypeId);
    
    // Transform the monster into a pacified version
    const originalName = monster.name;
    
    // Update the monster's type and name
    monster.type = pacifiedMonsterTypeId;

    // console.log(`Transformed ${originalName} (${originalType}) into ${monster.name} (${monster.type})`);
    // Log the banishment
    questStore.logAndNotifyQuestEvent(
        `${originalName} was pacified with ${item.name}`,
        { xp: 1 }
    )

    return true;
  }

  generateEffectDescription(item: Item): string {
    return `Pacify ${this.getTargetDescription(item)}.`;
  }
} 

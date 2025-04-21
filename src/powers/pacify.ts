import type { Item, MonsterTypeId, Monster, MonsterLevel } from '../types'
import { ItemPower } from './abstractItemPower'
import { monsterTypes } from '../data/monsterTypes'
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
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = 'elite';
  
  // Item types for this power
  readonly itemTypes = ["Water Vial", "Calming Spray", "Peace Pendant", "Tranquil Mist", "Serene Orb", "Still Water Crystal"];

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
    const monsterType = monsterTypes.find(m => m.id === monster.type);
    
    // Guard: check if we found the monster type
    if (!monsterType) {
      console.warn(`Could not find type information for monster ${monster.name}`);
      return false;
    }
    
    // Guard: check if monster is a boss (though we shouldn't be targeting them)
    if (monsterType.level === 'boss') {
      console.warn(`Cannot pacify boss monster ${monster.name}`);
      return false;
    }
    
    // Get the appropriate pacified monster for this level
    const pacifiedMonsterTypeId = this.pacifiedMonsterMap[monsterType.level];
    const pacifiedMonsterType = monsterTypes.find(m => m.id === pacifiedMonsterTypeId);
    
    // Guard: check if we found the pacified monster type
    if (!pacifiedMonsterType) {
      console.warn(`Could not find pacified monster type for level ${monsterType.level}`);
      return false;
    }
    
    // Transform the monster into a pacified version
    const originalName = monster.name;
    
    // Update the monster's type and name
    monster.type = pacifiedMonsterTypeId;

    // console.log(`Transformed ${originalName} (${originalType}) into ${monster.name} (${monster.type})`);
    // Log the banishment
    questStore.updateStats(1,0,0,
        `${originalName} was pacified with ${item.name}`)

    return true;
  }

  generateEffectDescription(item: Item): string {
    const qualityTerm = this.getLevelQualityTerm(item.level);
    return `This ${qualityTerm} item pacifies ${this.getTargetDescription(item)}.`;
  }
} 

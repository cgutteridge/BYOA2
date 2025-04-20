import type { Item, MonsterTypeId, Monster, MonsterLevel } from '../types'
import { ItemPower } from './abstractItemPower'
import { monsterTypes } from '../data/monsterTypes'
import { toMonsterTypeId } from '../types'
import {useQuestStore} from "@/stores/questStore.ts";

/**
 * Petrify power implementation - transforms monsters into stone versions
 * Turns any enemy into a petrified monster of the same level
 * Will not work on bosses
 */
export class PetrifyPower extends ItemPower {
  // UI properties
  readonly displayName = "Petrify";
  readonly icon = "🪨";
  readonly glowColor = "rgba(128, 128, 128, 0.8)";
  
  // Item generation constants
  readonly baseCost = 1;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = 'elite'; // Can't target bosses

  // Map from level to appropriate petrified monster
  private readonly petrifiedMonsterMap: Record<MonsterLevel, MonsterTypeId> = {
    'minion': toMonsterTypeId('petrified_minion'),
    'grunt': toMonsterTypeId('petrified_grunt'),
    'elite': toMonsterTypeId('petrified_elite'),
    'boss': toMonsterTypeId('petrified_elite'), // Fallback, but bosses can't be targeted anyway
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
      console.log(`Could not find type information for monster ${monster.name}`);
      return false;
    }
    
    // Guard: check if monster is a boss (though we shouldn't be targeting them)
    if (monsterType.level === 'boss') {
      console.log(`Cannot petrify boss monster ${monster.name}`);
      return false;
    }
    
    // Get the appropriate petrified monster for this level
    const petrifiedMonsterTypeId = this.petrifiedMonsterMap[monsterType.level];
    const petrifiedMonsterType = monsterTypes.find(m => m.id === petrifiedMonsterTypeId);
    
    // Guard: check if we found the petrified monster type
    if (!petrifiedMonsterType) {
      console.log(`Could not find petrified monster type for level ${monsterType.level}`);
      return false;
    }
    
    // Transform the monster into a petrified version
    const originalType = monster.type;
    const originalName = monster.name;

    // Update the monster's type and name
    monster.type = petrifiedMonsterTypeId;
    monster.name = petrifiedMonsterType.title;
    
    console.log(`Transformed ${originalName} (${originalType}) into ${monster.name} (${monster.type})`);
    // Log the banishment
    questStore.updateStats(1,0,0,
        `${originalName} was turned to stone with ${item.name}`)


    return true;
  }
} 
import type { Item, MonsterTypeId, Monster, MonsterLevel } from '../types'
import { ItemPower } from './abstractItemPower'
import { monsterTypes } from '../data/monsterTypes'
import { toMonsterTypeId } from '../types'
import {useQuestStore} from "@/stores/questStore.ts";

/**
 * Stun power implementation - transforms monsters into stunned versions
 * Turns any enemy into a stunned monster of the same level
 * Will not work on bosses
 */
export class StunPower extends ItemPower {
  // UI properties
  readonly displayName = "Stun";
  readonly icon = "🍋";
  readonly glowColor = "rgba(255, 235, 59, 0.8)";
  
  // Item generation constants
  readonly baseCost = 1;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = 'elite';

  // Map from level to appropriate stunned monster
  private readonly stunnedMonsterMap: Record<MonsterLevel, MonsterTypeId> = {
    'minion': toMonsterTypeId('stunned_minion'),
    'grunt': toMonsterTypeId('stunned_grunt'),
    'elite': toMonsterTypeId('stunned_elite'),
    'boss': toMonsterTypeId('stunned_elite'), // Fallback, but bosses can't be targeted anyway
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
      console.log(`Cannot stun boss monster ${monster.name}`);
      return false;
    }
    
    // Get the appropriate stunned monster for this level
    const stunnedMonsterTypeId = this.stunnedMonsterMap[monsterType.level];
    const stunnedMonsterType = monsterTypes.find(m => m.id === stunnedMonsterTypeId);
    
    // Guard: check if we found the stunned monster type
    if (!stunnedMonsterType) {
      console.log(`Could not find stunned monster type for level ${monsterType.level}`);
      return false;
    }
    
    // Transform the monster into a stunned version
    const originalType = monster.type;
    const originalName = monster.name;
    
    // Update the monster's type and name
    monster.type = stunnedMonsterTypeId;

    console.log(`Transformed ${originalName} (${originalType}) into ${monster.name} (${monster.type})`);
    // Log the banishment
    questStore.updateStats(1,0,0,
        `${originalName} was stunned with ${item.name}`)

    return true;
  }
} 
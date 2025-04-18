import type { Item, MonsterTypeId, Monster, MonsterLevel } from '../types'
import { ItemPower } from './abstractItemPower'
import { monsterTypes } from '../data/monsterTypes'
import { toMonsterTypeId } from '../types'

/**
 * Distract power implementation - transforms monsters into distracted versions
 * Turns any enemy into a distracted monster of the same level
 * Will not work on bosses
 */
export class DistractPower extends ItemPower {
  // UI properties
  readonly displayName = "Distract";
  readonly icon = "🥤";
  readonly glowColor = "rgba(139, 0, 139, 0.8)";
  
  // Item generation constants
  readonly baseCost = 1;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions: MonsterLevel[] = ['minion', 'grunt', 'elite']; // Can't target bosses

  // Map from level to appropriate distracted monster
  private readonly distractedMonsterMap: Record<MonsterLevel, MonsterTypeId> = {
    'minion': toMonsterTypeId('distracted_minion'),
    'grunt': toMonsterTypeId('distracted_grunt'),
    'elite': toMonsterTypeId('distracted_elite'),
    'boss': toMonsterTypeId('distracted_elite'), // Fallback, but bosses can't be targeted anyway
  };

  applyEffect(_item: Item, monster: Monster): boolean {
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
      console.log(`Cannot distract boss monster ${monster.name}`);
      return false;
    }
    
    // Get the appropriate distracted monster for this level
    const distractedMonsterTypeId = this.distractedMonsterMap[monsterType.level];
    const distractedMonsterType = monsterTypes.find(m => m.id === distractedMonsterTypeId);
    
    // Guard: check if we found the distracted monster type
    if (!distractedMonsterType) {
      console.log(`Could not find distracted monster type for level ${monsterType.level}`);
      return false;
    }
    
    // Transform the monster into a distracted version
    const originalType = monster.type;
    const originalName = monster.name;
    
    // Update the monster's type and name
    monster.type = distractedMonsterTypeId;
    monster.name = distractedMonsterType.title;
    
    console.log(`Transformed ${originalName} (${originalType}) into ${monster.name} (${monster.type})`);
    
    return true;
  }
} 
import type { Item, MonsterTypeId, Monster, MonsterLevel } from '../types'
import { ItemPower } from './abstractItemPower'
import { monsterTypes } from '../data/monsterTypes'
import { toMonsterTypeId } from '../types'

/**
 * Vegetate power implementation - transforms monsters into plant-like versions
 * Turns any enemy into a vegetated monster of the same level
 * Will not work on bosses
 */
export class VegetatePower extends ItemPower {
  // UI properties
  readonly displayName = "Vegetate";
  readonly icon = "🧃";
  readonly glowColor = "rgba(76, 175, 80, 0.8)";
  
  // Item generation constants
  readonly baseCost = 2;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions: MonsterLevel[] = ['minion', 'grunt', 'elite']; // Can't target bosses

  // Map from level to appropriate vegetated monster
  private readonly vegetatedMonsterMap: Record<MonsterLevel, MonsterTypeId> = {
    'minion': toMonsterTypeId('veg_minion'),
    'grunt': toMonsterTypeId('veg_grunt'),
    'elite': toMonsterTypeId('veg_elite'),
    'boss': toMonsterTypeId('veg_elite'), // Fallback, but bosses can't be targeted anyway
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
      console.log(`Cannot vegetate boss monster ${monster.name}`);
      return false;
    }
    
    // Get the appropriate vegetated monster for this level
    const vegetatedMonsterTypeId = this.vegetatedMonsterMap[monsterType.level];
    const vegetatedMonsterType = monsterTypes.find(m => m.id === vegetatedMonsterTypeId);
    
    // Guard: check if we found the vegetated monster type
    if (!vegetatedMonsterType) {
      console.log(`Could not find vegetated monster type for level ${monsterType.level}`);
      return false;
    }
    
    // Transform the monster into a vegetated version
    const originalType = monster.type;
    const originalName = monster.name;
    
    // Update the monster's type and name
    monster.type = vegetatedMonsterTypeId;
    monster.name = vegetatedMonsterType.title;
    
    console.log(`Transformed ${originalName} (${originalType}) into ${monster.name} (${monster.type})`);
    
    return true;
  }
} 
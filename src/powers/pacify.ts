import type { Item, MonsterTypeId, Monster, MonsterLevel } from '../types'
import { ItemPower } from './abstractItemPower'
import { monsterTypes } from '../data/monsterTypes'
import { toMonsterTypeId } from '../types'

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
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions: MonsterLevel[] = ['minion', 'grunt', 'elite']; // Can't target bosses

  // Map from level to appropriate pacified monster
  private readonly pacifiedMonsterMap: Record<MonsterLevel, MonsterTypeId> = {
    'minion': toMonsterTypeId('passive_minion'),
    'grunt': toMonsterTypeId('passive_grunt'),
    'elite': toMonsterTypeId('passive_elite'),
    'boss': toMonsterTypeId('passive_elite'), // Fallback, but bosses can't be targeted anyway
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
      console.log(`Cannot pacify boss monster ${monster.name}`);
      return false;
    }
    
    // Get the appropriate pacified monster for this level
    const pacifiedMonsterTypeId = this.pacifiedMonsterMap[monsterType.level];
    const pacifiedMonsterType = monsterTypes.find(m => m.id === pacifiedMonsterTypeId);
    
    // Guard: check if we found the pacified monster type
    if (!pacifiedMonsterType) {
      console.log(`Could not find pacified monster type for level ${monsterType.level}`);
      return false;
    }
    
    // Transform the monster into a pacified version
    const originalType = monster.type;
    const originalName = monster.name;
    
    // Update the monster's type and name
    monster.type = pacifiedMonsterTypeId;
    monster.name = pacifiedMonsterType.title;
    
    console.log(`Transformed ${originalName} (${originalType}) into ${monster.name} (${monster.type})`);
    
    return true;
  }
} 
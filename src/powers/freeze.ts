import type { Item, MonsterTypeId, Monster, MonsterLevel } from '../types'
import { ItemPower, PowerResult } from './abstractItemPower'
import { monsterTypes } from '../data/monsterTypes'
import { useQuestStore } from '@/stores/questStore'
import { toMonsterTypeId } from '../types'

/**
 * Freeze power implementation - transforms monsters into ice versions
 * Turns any enemy into an ice monster of the same level
 * Will not work on bosses
 */
export class FreezePower extends ItemPower {
  // UI properties
  readonly displayName = "Freeze";
  readonly icon = "❄️";
  readonly glowColor = "rgba(0, 191, 255, 0.8)";
  
  // Item generation constants
  readonly baseCost = 2;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions: MonsterLevel[] = ['minion', 'grunt', 'elite']; // Can't target bosses

  // Map from level to appropriate ice monster
  private readonly iceMonsterMap: Record<MonsterLevel, MonsterTypeId> = {
    'minion': toMonsterTypeId('ice_shard'),
    'grunt': toMonsterTypeId('frost_golem'),
    'elite': toMonsterTypeId('glacial_titan'),
    'boss': toMonsterTypeId('glacial_titan'), // Fallback, but bosses can't be targeted anyway
  };

  applyEffect(item: Item, monster: Monster): boolean {
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
      console.log(`Cannot freeze boss monster ${monster.name}`);
      return false;
    }
    
    // Get the appropriate ice monster for this level
    const iceMonsterTypeId = this.iceMonsterMap[monsterType.level];
    const iceMonsterType = monsterTypes.find(m => m.id === iceMonsterTypeId);
    
    // Guard: check if we found the ice monster type
    if (!iceMonsterType) {
      console.log(`Could not find ice monster type for level ${monsterType.level}`);
      return false;
    }
    
    // Transform the monster into an ice version
    const originalType = monster.type;
    const originalName = monster.name;
    
    // Update the monster's type and name
    monster.type = iceMonsterTypeId;
    monster.name = iceMonsterType.title;
    
    console.log(`Transformed ${originalName} (${originalType}) into ${monster.name} (${monster.type})`);
    
    return true;
  }
} 
import type {Item, Monster, MonsterLevel, MonsterTypeId} from '../types'
import {toMonsterTypeId} from '../types'
import {ItemPower} from './abstractItemPower'
import {monsterTypes} from '../data/monsterTypes'
import {useQuestStore} from "@/stores/questStore.ts";

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
  readonly baseCost = 1;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = 'elite';
  
  // Item types for this power
  readonly itemTypes = ["Ice Crystal", "Frost Stone", "Cold Gem", "Freezing Orb", "Glacier Shard", "Winter Sphere"];

  // Map from level to appropriate ice monster
  private readonly iceMonsterMap: Record<MonsterLevel, MonsterTypeId> = {
    'minion': toMonsterTypeId('ice_shard'),
    'grunt': toMonsterTypeId('frost_golem'),
    'elite': toMonsterTypeId('glacial_titan'),
    'boss': toMonsterTypeId('glacial_titan'), // Fallback, but bosses can't be targeted anyway
  };

  applyEffect(item: Item, monster: Monster): boolean {
    const questStore = useQuestStore();

    // Guard: check if monster exists and is alive
    if (!monster || !monster.alive) {
      return false;
    }
    
    // Find the monster type to get its level
    const monsterTypeInfo = monsterTypes.find(t => t.id === monster.type);
    
    // Guard: check if we found the monster type
    if (!monsterTypeInfo) {
      console.log(`Could not find type information for monster ${monster.name}`);
      return false;
    }
    
    // Guard: check if monster is a boss (though we shouldn't be targeting them)
    if (monsterTypeInfo.level === 'boss') {
      console.log(`Cannot freeze boss monster ${monster.name}`);
      return false;
    }
    
    // Get the appropriate ice monster for this level
    const frozenTypeId = this.iceMonsterMap[monsterTypeInfo.level];
    const frozenTypeInfo = monsterTypes.find(t => t.id === frozenTypeId);
    
    // Guard: check if we found the ice monster type
    if (!frozenTypeInfo) {
      console.log(`Could not find ice monster type for level ${monsterTypeInfo.level}`);
      return false;
    }

    // Transform the monster to ice
    monster.type = frozenTypeId;

    // Log the transformation
    questStore.updateStats(1,0,0,
        `${monsterTypeInfo.title} was frozen into ice with ${item.name}`)

    return true;
  }

  generateEffectDescription(item: Item): string {
    const qualityTerm = this.getLevelQualityTerm(item.level);
    return `This ${qualityTerm} item transforms ${this.getTargetDescription(item)} into an ice monster of the same level.`;
  }
} 
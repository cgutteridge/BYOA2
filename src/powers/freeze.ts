import type {Item, Monster, MonsterLevel, MonsterTypeId} from '../types'
import {toMonsterTypeId} from '../types'
import {ItemPower} from './abstractItemPower'
import {monsterTypeById} from '../data/monsterTypesLoader'
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
  readonly generateWeight = 12;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = 'elite';

  readonly itemTargetType = 'monsters';

  // Item types for this power
  readonly itemArtifactNames = ["Ice Crystal", "Frost Stone", "Cold Gem", "Freezing Orb", "Glacier Shard", "Winter Sphere"];

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
    const monsterTypeInfo = monsterTypeById(monster.type);
    
    // Guard: check if monster is a boss (though we shouldn't be targeting them)
    if (monsterTypeInfo.level === 'boss') {
      console.warn(`Cannot freeze boss monster ${monster.name}`);
      return false;
    }
    
    // Get the appropriate ice monster for this level
    const iceMonsterTypeId = this.iceMonsterMap[monsterTypeInfo.level];
    const iceMonsterType = monsterTypeById(iceMonsterTypeId);

    // Transform the monster to ice
    monster.type = iceMonsterTypeId;

    // Log the transformation
    questStore.logAndNotifyQuestEvent(
        `${monsterTypeInfo.title} was frozen with ${item.name}`,
        { xp: 1 }
    )

    return true;
  }

  generateEffectDescription(item: Item): string {
    return `Freeze ${this.getTargetDescription(item)}.`;
  }
} 
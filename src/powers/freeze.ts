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


    /*
    // Map from level to appropriate ice monster
    const iceMonsterMap: Record<string, string> = {
      'minion': 'ice_shard', // Minions become ice shards
      'grunt': 'frost_golem', // Grunts become frost golems
      'elite': 'glacial_titan', // Elites become glacial titans
      // No boss mapping as bosses can't be frozen
    };
    */


} 
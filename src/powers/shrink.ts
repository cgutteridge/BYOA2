import type { Item, Monster, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './abstractItemPower'
import { monsterTypes } from '../data/monsterTypes'
import { useQuestStore } from '@/stores/questStore.ts'
import { toMonsterId } from '@/types'

/**
 * Shrink power implementation
 */
export class ShrinkPower extends ItemPower {
  // UI properties
  readonly displayName = "Shrink";
  readonly icon = "🔍";
  readonly glowColor = "rgba(135, 206, 250, 0.8)";
  
  // Item generation constants
  readonly baseCost = 2;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions = null; // Can target any level

  // Funny name patterns for shrunken monsters
  private readonly shrinkNames = [
    'Little {name}',
    '{name} the Lesser',
    'Mini {name}',
    'Tiny {name}',
    'Pocket {name}',
    '{name} Jr.',
    'Wee {name}',
    'Itty Bitty {name}',
    '{name} (Compact Edition)',
    'Fun-Size {name}',
    'Travel-Size {name}',
    'Shrunk {name}',
    '{name} Lite',
    'Half-Pint {name}',
    'Diminutive {name}',
    'Micro {name}',
    '{name} the Small',
    'Shrunken {name}',
    'Bite-Size {name}',
    '{name} the Reduced'
  ];

  /**
   * Apply the shrink effect to a monster, transforming it to its lesser form
   * @param item The item being used
   * @param monster The monster to shrink
   * @returns Whether the operation was successful
   */
  applyEffect(item: Item, monster: Monster): boolean {
    // Get the monster's type definition
    const monsterTypeDef = monsterTypes.find(mt => mt.id === monster.type);
    if (!monsterTypeDef) return false;
    
    // Check if the monster has a lesser form defined
    if (!monsterTypeDef.lesser) return false;
    
    // Get the quest store to modify monsters
    const questStore = useQuestStore();
    
    // Make sure we have access to the current pub
    const pub = questStore.currentPub;
    if (!pub || !pub.monsters) return false;
    
    // Find the original monster
    const monsterIndex = pub.monsters.findIndex(m => m.id === monster.id);
    if (monsterIndex === -1) return false;
    
    // Generate a fun name for the shrunken monster
    const randomNameIndex = Math.floor(Math.random() * this.shrinkNames.length);
    const newName = this.shrinkNames[randomNameIndex].replace('{name}', monster.name);
    
    // Transform the monster into its lesser form
    const originalMonster = pub.monsters[monsterIndex];
    
    // Create the shrunken version, preserving original ID and item
    pub.monsters[monsterIndex] = {
      ...originalMonster,
      type: monsterTypeDef.lesser,
      name: newName
    };
    
    return true;
  }
} 
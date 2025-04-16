import type { Item, Monster, MonsterTypeId } from '../types'
import { ItemPower, PowerResult } from './abstractItemPower'
import { monsterTypes } from '../data/monsterTypes'
import { useQuestStore } from '@/stores/questStore.ts'
import { toMonsterId } from '@/types'

/**
 * Split power implementation
 */
export class SplitPower extends ItemPower {
  // UI properties
  readonly displayName = "Split";
  readonly icon = "✂️";
  readonly glowColor = "rgba(255, 165, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 3;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions = null; // Can target any level

  /**
   * Apply the split effect to a monster, creating lesser versions
   * @param item The item being used
   * @param monster The monster to split
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
    
    // "Kill" the original monster
    const monsterIndex = pub.monsters.findIndex(m => m.id === monster.id);
    if (monsterIndex === -1) return false;
    
    pub.monsters[monsterIndex].alive = false;
    
    // Determine how many lesser monsters to create
    let count = 2; // Default is 2
    
    if (monsterTypeDef.lesserCount !== undefined) {
      if (monsterTypeDef.lesserCount === "playerCount") {
        // If set to playerCount, use the number of players in the party
        count = questStore.playerCount || 2;
      } else {
        // Otherwise use the specified number
        count = monsterTypeDef.lesserCount;
      }
    }
    
    // Create the specified number of lesser monsters
    for (let i = 0; i < count; i++) {
      const newMonster: Monster = {
        id: toMonsterId(`${monster.id}_lesser_${i}`),
        type: monsterTypeDef.lesser,
        name: `${monster.name}'s Lesser Form ${i + 1}`,
        alive: true
      };
      
      pub.monsters.push(newMonster);
    }
    
    return true;
  }
} 
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

  useOnMonster(item: Item, monsterId: string): PowerResult {
    console.log(`Using ${item.name} to freeze monster ${monsterId}`);
    
    // Reduce uses
    this.reduceUses(item);
    
    // Get the quest store
    const questStore = useQuestStore();
    
    // Get the current location's monsters
    const pub = questStore.currentPub;
    if (!pub || !pub.monsters) {
      return {
        success: false,
        message: `${item.name} couldn't find any monsters to target.`
      };
    }
    
    // Find the monster with the given ID
    const monster = pub.monsters.find(m => m.id === monsterId);
    if (!monster) {
      return {
        success: false,
        message: `${item.name} couldn't find the monster.`
      };
    }
    
    // Freeze the monster using shared helper
    const success = this.freezeMonster(monster);
    
    return {
      success,
      message: success ? `${item.name} froze the monster!` : `${item.name} failed to freeze the monster.`
    };
  }

  useOnType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to freeze all monsters of type ${type}`);
    
    // Reduce uses
    this.reduceUses(item);
    
    // Find monster type to check if it's a boss
    const monsterType = monsterTypes.find(mt => mt.id === type);
    if (monsterType?.level === "boss") {
      return {
        success: false,
        message: `${item.name} failed to freeze the ${type}s. Bosses are immune to freezing!`
      };
    }
     
    // Find all monsters of this type in the current pub
    const questStore = useQuestStore();
    const monsters = questStore.currentPub?.monsters?.filter(
      monster => monster.type === type && monster.alive
    );
     
    if (!monsters || monsters.length === 0) {
      return {
        success: false,
        message: `No valid targets of type ${type} found.`
      };
    }
     
    // Apply freezing effect to each monster
    let frozenCount = 0;
    monsters.forEach(monster => {
      if (this.freezeMonster(monster)) {
        frozenCount++;
      }
    });
    
    // Return result based on how many monsters were frozen
    return {
      success: frozenCount > 0,
      message: frozenCount > 0 
        ? `${item.name} froze ${frozenCount} ${type}${frozenCount > 1 ? 's' : ''} into ice cubes!` 
        : `${item.name} failed to freeze any ${type}s.`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to freeze monster ${monsterId}`);
    
    // Find the actual monster object from the current pub
    const questStore = useQuestStore();
    const monster = questStore.currentPub?.monsters?.find(m => m.id === monsterId);
     
    if (!monster) {
      return false;
    }
     
    // Apply freezing effect to the monster
    return this.freezeMonster(monster);
  }
  
  /**
   * Freeze a monster if possible
   * @param monster The monster to freeze
   * @returns true if monster was frozen, false otherwise
   */
  private freezeMonster(monster: Monster): boolean {
    // Get monster type to check if it's a boss
    const monsterType = monsterTypes.find(mt => mt.id === monster.type);
    if (monsterType?.level === "boss") {
      return false; // Bosses are immune to freezing
    }
    
    // Transform the monster into an ice version
    return this.transformToIceMonster(monster);
  }
  
  /**
   * Transform a monster into its ice version based on level
   */
  private transformToIceMonster(monster: Monster): boolean {
    // Look up the monster's current level
    const monsterType = monsterTypes.find(mt => mt.id === monster.type);
    if (!monsterType) return false;
    
    // Map from level to appropriate ice monster
    const iceMonsterMap: Record<string, string> = {
      'minion': 'ice_shard', // Minions become ice shards
      'grunt': 'frost_golem', // Grunts become frost golems
      'elite': 'glacial_titan', // Elites become glacial titans
      // No boss mapping as bosses can't be frozen
    };
    
    const newTypeString = iceMonsterMap[monsterType.level];
    if (!newTypeString) return false;
    
    // Get the ice monster type
    const iceMonsterType = monsterTypes.find(mt => mt.id === newTypeString);
    if (!iceMonsterType) return false;
    
    // Update the monster's type and name to ice version
    monster.type = toMonsterTypeId(newTypeString);
    monster.name = `Frozen ${monster.name}`;
    
    return true;
  }
  

} 
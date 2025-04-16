import type { Item, MonsterTypeId, Monster } from '../types'
import { ItemPower, PowerResult } from './types'
import { monsterTypes } from '../data/monsterTypes'
import { useQuestStore } from '@/stores/questStore'
import { toMonsterTypeId } from '../types'

/**
 * Freeze power implementation - transforms monsters into ice versions
 * Turns any enemy into an ice monster of the same level
 * Will not work on bosses
 */
export class FreezePower extends ItemPower {
  readonly displayName = "Freeze";
  readonly icon = "❄️";
  readonly glowColor = "rgba(0, 191, 255, 0.8)";

  applyToMonster(item: Item, monsterId: string): PowerResult {
    // Find the actual monster object from the current pub
    const questStore = useQuestStore();
    const monster = questStore.currentPub?.monsters?.find(m => m.id === monsterId);
    
    if (!monster) {
      return {
        success: false,
        message: `${item.name} couldn't find the target monster.`
      };
    }
    
    // Get monster type to check if it's a boss
    const monsterType = monsterTypes.find(mt => mt.id === monster.type);
    if (monsterType?.level === "boss") {
      return {
        success: false,
        message: `${item.name} failed to freeze the monster. Bosses are immune to freezing!`
      };
    }
    
    // Call the implementation-specific effect method
    const success = this.applyEffect(item, monsterId);
    
    return {
      success,
      message: success 
        ? `${item.name} froze the monster into an ice cube you can add to a drink!` 
        : `${item.name} failed to freeze the monster.`
    };
  }

  applyToType(item: Item, type: MonsterTypeId): PowerResult {
    console.log(`Using ${item.name} to freeze all monsters of type ${type}`);
    
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
    
    // Transform each monster into an ice version
    monsters.forEach(monster => {
      this.transformToIceMonster(monster);
    });
    
    return {
      success: true,
      message: `${item.name} froze all ${type}s into ice cubes!`
    };
  }

  applyEffect(item: Item, monsterId: string): boolean {
    console.log(`Using ${item.name} to freeze monster ${monsterId}`);
    
    // Find the actual monster object from the current pub
    const questStore = useQuestStore();
    const monster = questStore.currentPub?.monsters?.find(m => m.id === monsterId);
    
    if (!monster) {
      return false; // Monster not found
    }
    
    // Can't freeze bosses
    const monsterType = monsterTypes.find(mt => mt.id === monster.type);
    if (monsterType?.level === "boss") {
      return false;
    }
    
    // Transform this monster into an ice version
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
  
  /**
   * Override to prevent targeting boss monsters
   */
  protected canTargetMonsterType(monsterType: any): boolean {
    // Cannot target boss monsters with freeze
    return monsterType.level !== "boss";
  }
} 
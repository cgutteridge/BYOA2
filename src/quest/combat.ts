import { useQuestStore } from '@/stores/questStore.ts';
import { useInventoryStore } from '@/stores/inventoryStore.ts';
import { monsterTypes } from '@/data/monsterTypes.ts';
import { Monster } from '@/types';
import { generateRandomItem } from './generateRandomItem.ts';

/**
 * Toggles the alive status of a monster and updates XP accordingly
 * @param monster - The monster to toggle status for
 */
export function toggleMonsterStatus(monster: Monster): void {
  const questStore = useQuestStore();
  
  // Toggle the alive status
  const wasAlive = monster.alive;
  monster.alive = !wasAlive;
  
  // Find the monster type to get XP value
  const monsterType = monsterTypes.find(m => m.id === monster.type);
  if (monsterType) {
    // Add XP when defeating, remove XP when undefeating
    if (wasAlive) {
      // Monster was alive and now is defeated - add XP
      questStore.addXP(monsterType.xp);
      console.log(`Added ${monsterType.xp} XP for defeating ${monster.name}`);
      
    } else {
      // Monster was defeated and now is alive - remove XP
      questStore.addXP(-monsterType.xp);
      console.log(`Removed ${monsterType.xp} XP for undefeating ${monster.name}`);
    }
  }
}

/**
 * Check if all monsters in an array are defeated
 * @param monsters - Array of monsters to check
 * @returns true if all monsters are defeated, false otherwise
 */
export function areAllMonstersDefeated(monsters: Monster[]): boolean {
  if (!monsters || monsters.length === 0) return false;
  return monsters.every(monster => !monster.alive);
}

/**
 * Claims an item from a defeated monster and adds it to the player's inventory
 * @param monster - The monster to claim the item from
 * @returns True if item was successfully claimed
 */
export function claimMonsterItem(monster: Monster): boolean {
  // Can only claim from defeated monsters that have an item
  if (!monster.alive && monster.item) {
    const inventoryStore = useInventoryStore();
    const itemName = monster.item.name; // Store name before removal
    
    // Add the item directly to inventory
    inventoryStore.addItem(monster.item);
    
    // Remove the item from the monster
    delete monster.item;
    
    console.log(`Claimed item ${itemName} from ${monster.name}`);
    return true;
  }
  
  return false;
}

/**
 * Banishes a monster from the location without getting any loot
 * @param monster - The monster to banish
 * @returns True if monster was successfully banished
 */
export function banishMonster(monster: Monster): boolean {
  if (!monster.alive) {
    console.log(`${monster.name} is already defeated and cannot be banished.`);
    return false;
  }
  
  // Find the monster type to get XP value (needed for stats tracking)
  const monsterType = monsterTypes.find(m => m.id === monster.type);
  if (monsterType) {
    // Add XP for defeating the monster
    const questStore = useQuestStore();
    questStore.addXP(monsterType.xp);
    console.log(`Added ${monsterType.xp} XP for banishing ${monster.name}`);
  }
  
  // Mark the monster as defeated but don't process any drops
  monster.alive = false;
  
  // If the monster had an item, it's lost forever
  if (monster.item) {
    console.log(`${monster.name} was banished with ${monster.item.name}, which is now lost forever.`);
    // The item is intentionally not collected
    delete monster.item;
  } else {
    console.log(`${monster.name} was banished from the realm.`);
  }
  
  return true;
} 
import { useQuestStore } from '@/stores/questStore.ts';
import { useInventoryStore } from '@/stores/inventoryStore.ts';
import { monsterTypes } from '@/data/monsterTypes.ts';
import { Monster } from '@/types';

/**
 * Toggles the alive status of a monster and updates XP and Units accordingly
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
    if (wasAlive) {
      // Monster was alive and now is defeated - add XP and Units
      const playerCount = questStore.playerCount;
      
      // Check if this monster has player count scaling
      let xpToAdd = monsterType.xp;
      let unitsToAdd = monsterType.units;
      
      // Apply player count scaling if applicable
      if (monsterType.lesserCount === "playerCount") {
        xpToAdd = monsterType.xp * playerCount;
        unitsToAdd = monsterType.units * playerCount;
        console.log(`Player count scaling: ${playerCount}x for ${monster.name}`);
      }
      
      // Only add XP when defeating
      questStore.addXP(xpToAdd);
      console.log(`Added ${xpToAdd} XP for defeating ${monster.name}`);
      
      // Only add Units when defeating (not for banishing)
      questStore.addUnits(unitsToAdd);
      console.log(`Added ${unitsToAdd} Units of alcohol for defeating ${monster.name}`);
    } else {
      // Monster was defeated and now is alive - remove XP only (not Units)
      // Check if this monster has player count scaling
      let xpToRemove = monsterType.xp;
      
      // Apply player count scaling if applicable
      if (monsterType.lesserCount === "playerCount") {
        xpToRemove = monsterType.xp * questStore.playerCount;
      }
      
      questStore.addXP(-xpToRemove);
      console.log(`Removed ${xpToRemove} XP for undefeating ${monster.name}`);
      // Note: We don't remove units when undefeating - the drinks have already been consumed!
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
 * Get the monster XP value, accounting for player count scaling if applicable
 * @param monster - The monster to get XP for
 * @returns The XP value, scaled if needed
 */
export function getMonsterXP(monster: Monster): number {
  const questStore = useQuestStore();
  
  // Find the monster type definition
  const monsterType = monsterTypes.find(type => type.id === monster.type);
  if (!monsterType) return 1;
  
  // Apply player count scaling if applicable
  if (monsterType.lesserCount === "playerCount") {
    return monsterType.xp * questStore.playerCount;
  }
  
  // Return regular XP value
  return monsterType.xp;
}

/**
 * Get the monster Units value, accounting for player count scaling if applicable
 * @param monster - The monster to get Units for
 * @returns The Units value, scaled if needed
 */
export function getMonsterUnits(monster: Monster): number {
  const questStore = useQuestStore();
  
  // Find the monster type definition
  const monsterType = monsterTypes.find(type => type.id === monster.type);
  if (!monsterType) return 1;
  
  // Apply player count scaling if applicable
  if (monsterType.lesserCount === "playerCount") {
    return monsterType.units * questStore.playerCount;
  }
  
  // Return regular Units value
  return monsterType.units;
} 
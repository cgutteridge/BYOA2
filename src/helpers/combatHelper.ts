import { useQuestStore } from '@/stores/questStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { monsterTypes } from '@/data/monsterTypes';
import { Monster, Item } from '@/types';
import { getRandomSampleItem } from '@/data/sampleItems';
import type { EnhancedItem, ItemPower } from '@/types/item';

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
      
      // Generate a random item drop if monster doesn't already have one
      if (!monster.item) {
        generateMonsterDrop(monster, monsterType.level);
      }
    } else {
      // Monster was defeated and now is alive - remove XP
      questStore.addXP(-monsterType.xp);
      console.log(`Removed ${monsterType.xp} XP for undefeating ${monster.name}`);
    }
  }
}

/**
 * Generates a random item drop for a monster based on its level
 * @param monster - The monster to generate a drop for
 * @param monsterLevel - The level of the monster
 */
function generateMonsterDrop(monster: Monster, monsterLevel: string): void {
  // Determine drop chance based on monster level
  let dropChance = 0;
  switch (monsterLevel) {
    case 'minion':
      dropChance = 0.2; // 20% chance for minions
      break;
    case 'grunt':
      dropChance = 0.3; // 30% chance for grunts
      break;
    case 'elite':
      dropChance = 0.5; // 50% chance for elites
      break;
    case 'boss':
      dropChance = 1.0; // 100% chance for bosses
      break;
    default:
      dropChance = 0.2;
  }

  // Determine if monster drops an item
  if (Math.random() < dropChance) {
    // For now, use sample items. In the future, this would be more sophisticated
    const newItem = getRandomSampleItem();
    
    // Convert EnhancedItem to Item format
    const itemForMonster: Item = {
      type: 'transmute', // Default to transmute but could be based on the power
      name: newItem.name,
      power: newItem.description,
      description: newItem.story,
      uses: newItem.uses || 1,
      level: 2, // Default level, could be based on monster level
    };
    
    monster.item = itemForMonster;
  }
}

/**
 * Checks if all monsters in a location are defeated
 * @param monsters - The array of monsters to check
 * @returns True if all monsters are defeated
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
    
    // Convert standard Item to EnhancedItem format
    const enhancedItem: EnhancedItem = {
      id: `${monster.type}_${Date.now()}`, // Generate a unique ID
      name: monster.item.name,
      description: monster.item.power,
      story: monster.item.description,
      uses: monster.item.uses,
      power: convertItemTypeToItemPower(monster.item.type, monster.item.level)
    };
    
    inventoryStore.addItem(enhancedItem);
    
    // Remove the item from the monster instead of marking it claimed
    delete monster.item;
    
    console.log(`Claimed item from ${monster.name}`);
    return true;
  }
  
  return false;
}

/**
 * Helper function to convert ItemTypeId to a specific ItemPower value
 */
function convertItemTypeToItemPower(type: string, level: number): ItemPower | undefined {
  // Simple mapping based on item type and level
  switch (type) {
    case 'kill':
      return level >= 3 ? 'kill_all' : 'kill_one';
    case 'transmute':
      return level >= 3 ? 'transmute_all' : 'transmute_one';
    case 'healing':
      // No direct equivalent in our power system yet
      return undefined;
    default:
      return undefined;
  }
} 
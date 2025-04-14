import { useQuestStore } from '@/stores/questStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { monsterTypes } from '@/data/monsterTypes';
import { Monster, Item, ItemTypeId } from '@/types';
import type { EnhancedItem, ItemPower, TargetScope } from '@/types/item';
import { generateRandomItem } from './generateRandomItem';

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
  let itemLevel = 1;
  
  switch (monsterLevel) {
    case 'minion':
      dropChance = 0.3; // 30% chance for minions
      itemLevel = 1;
      break;
    case 'grunt':
      dropChance = 0.4; // 40% chance for grunts
      itemLevel = 2;
      break;
    case 'elite':
      dropChance = 0.7; // 70% chance for elites
      itemLevel = 3;
      break;
    case 'boss':
      dropChance = 1.0; // 100% chance for bosses
      itemLevel = 4;
      break;
    default:
      dropChance = 0.3;
      itemLevel = 1;
  }

  // Determine if monster drops an item
  if (Math.random() < dropChance) {
    // Use our new random item generator
    const enhancedItem = generateRandomItem(itemLevel);
    
    // Convert to simple Item format for storage on the monster
    const itemForMonster: Item = {
      id: enhancedItem.id,
      type: enhancedItem.power as ItemTypeId,
      name: enhancedItem.name,
      power: enhancedItem.description,
      description: '', // Empty description since we no longer generate stories
      uses: enhancedItem.uses || 1,
      level: itemLevel,
    };
    
    monster.item = itemForMonster;
    console.log(`Generated item ${itemForMonster.name} for ${monster.name}`);
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
    
    // Convert standard Item to EnhancedItem format
    const enhancedItem: EnhancedItem = {
      id: monster.item.id || `${monster.type}_${Date.now()}`, // Use existing ID or generate new one
      name: monster.item.name,
      description: monster.item.power,
      uses: monster.item.uses,
      power: convertItemType(monster.item.type),
      targetScope: getTargetScopeFromItemType(monster.item.type)
    };
    
    inventoryStore.addItem(enhancedItem);
    
    // Remove the item from the monster
    delete monster.item;
    
    console.log(`Claimed item ${enhancedItem.name} from ${monster.name}`);
    return true;
  }
  
  return false;
}

/**
 * Convert old item types to new power types
 */
function convertItemType(type: string): ItemPower {
  switch (type) {
    case 'kill_one':
    case 'kill_all':
    case 'kill':
      return 'kill';
    case 'transmute_one':
    case 'transmute_all':
    case 'transmute':
      return 'transmute';
    case 'scout_500':
      return 'scout_500';
    case 'scout_1000':
      return 'scout_1000';
    case 'scout_any':
      return 'scout_any';
    case 'shrink':
      return 'shrink';
    case 'split':
      return 'split';
    case 'pickpocket':
      return 'pickpocket';
    default:
      return 'kill'; // Default fallback
  }
}

/**
 * Get target scope from old item type
 */
function getTargetScopeFromItemType(type: string): TargetScope {
  if (type === 'kill_all' || type === 'transmute_all') {
    return 'all';
  }
  return 'one'; // Default to targeting a single entity
} 
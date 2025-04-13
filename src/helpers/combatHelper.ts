import { useQuestStore } from '@/stores/questStore';
import { monsterTypes } from '@/data/monsterTypes';
import { Monster } from '@/types';

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
 * Checks if all monsters in a location are defeated
 * @param monsters - The array of monsters to check
 * @returns True if all monsters are defeated
 */
export function areAllMonstersDefeated(monsters: Monster[]): boolean {
  if (!monsters || monsters.length === 0) return false;
  return monsters.every(monster => !monster.alive);
} 
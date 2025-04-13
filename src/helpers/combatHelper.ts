import { useQuestStore } from '@/stores/questStore';
import { monsterTypes } from '@/data/monsterTypes';
import { Unit } from '@/types';

/**
 * Toggles the alive status of an enemy and updates XP accordingly
 * @param unit - The unit containing the enemy
 * @param enemyIndex - Index of the enemy within the unit
 */
export function toggleEnemyStatus(unit: Unit, enemyIndex: number): void {
  const questStore = useQuestStore();
  const enemy = unit.members[enemyIndex];
  
  // Toggle the alive status
  const wasAlive = enemy.alive;
  enemy.alive = !wasAlive;
  
  // Find the monster type to get XP value
  const monster = monsterTypes.find(m => m.id === unit.type);
  if (monster) {
    // Add XP when defeating, remove XP when undefeating
    if (wasAlive) {
      // Enemy was alive and now is defeated - add XP
      questStore.addXP(monster.xp);
      console.log(`Added ${monster.xp} XP for defeating ${enemy.name}`);
    } else {
      // Enemy was defeated and now is alive - remove XP
      questStore.addXP(-monster.xp);
      console.log(`Removed ${monster.xp} XP for undefeating ${enemy.name}`);
    }
  }
}

/**
 * Checks if all enemies in a unit are defeated
 * @param unit - The unit to check
 * @returns True if all enemies in the unit are defeated
 */
export function isUnitDefeated(unit: Unit): boolean {
  return unit.members.every(enemy => !enemy.alive);
} 
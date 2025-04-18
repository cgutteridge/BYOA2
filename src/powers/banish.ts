import type { Item, Monster } from '../types'
import { ItemPower } from './abstractItemPower'
import { useQuestStore } from '@/stores/questStore.ts'

/**
 * Banish power implementation
 */
export class BanishPower extends ItemPower {
  // UI properties
  readonly displayName = "Banish";
  readonly icon = "🪄";
  readonly glowColor = "rgba(255, 20, 147, 0.8)"; // Deep pink
  
  // Item generation constants
  readonly baseCost = 1;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions = null; // Can target any level

  applyEffect(_item: Item, monster: Monster): boolean {
    // Guard: check if monster exists and is alive
    if (!monster || !monster.alive) {
      return false;
    }
    
    // Get the quest store to access the current location
    const questStore = useQuestStore();
    const currentLocation = questStore.currentLocation;
    
    // Guard: check if current location exists and has monsters
    if (!currentLocation || !currentLocation.monsters) {
      console.log('Cannot banish monster: no current location found');
      return false;
    }
    
    // Find the monster in the current location
    const monsterIndex = currentLocation.monsters.findIndex(m => m.id === monster.id);
    
    // Guard: check if monster was found
    if (monsterIndex === -1) {
      console.log(`Could not find monster ${monster.name} in the current location.`);
      return false;
    }
    
    // Store monster reference before removing it
    const removedMonster = currentLocation.monsters[monsterIndex];
    
    // Remove the monster from the location
    currentLocation.monsters.splice(monsterIndex, 1);
    
    // Log the banishment
    if (removedMonster.item) {
      console.log(`${removedMonster.name} was banished with ${removedMonster.item.name}, which is now lost forever.`);
    } else {
      console.log(`${removedMonster.name} was banished from the realm.`);
    }
    
    return true;
  }
} 
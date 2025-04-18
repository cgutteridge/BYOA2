import type { Item, Monster } from '../types'
import { ItemPower } from './abstractItemPower'
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

  // Silly name pairs for when exactly 2 monsters are created
  private readonly namePairs = [
    ['{name} Eastside', '{name} Westside'],
    ['Good {name}', 'Evil {name}'],
    ['Smart {name}', 'Dumb {name}'],
    ['{name} Prime', '{name} Beta'],
    ['Doctor {name}', 'Nurse {name}'],
    ['Sober {name}', 'Drunk {name}'],
    ['Original {name}', 'Knockoff {name}'],
    ['Fancy {name}', 'Plain {name}'],
    ['Smooth {name}', 'Chunky {name}'],
    ['Business {name}', 'Party {name}'],
    ['White {name}', 'Black {name}'],
    ['Captain {name}', 'First Mate {name}'],
    ['Sweet {name}', 'Salty {name}'],
    ['Classic {name}', 'Modern {name}'],
    ['Future {name}', 'Past {name}'],
    ['Positive {name}', 'Negative {name}'],
    ['{name} North', '{name} South'],
    ['{name} the Great', '{name} the Terrible'],
    ['{name} Senior', '{name} Junior'],
    ['{name} 2.0', '{name} Legacy']
  ];

  /**
   * Apply the split effect to a monster, creating lesser versions
   * @param item The item being used
   * @param monster The monster to split
   * @returns Whether the operation was successful
   */
  applyEffect(_item: Item, monster: Monster): boolean {
    // Get the monster's type definition
    const monsterTypeDef = monsterTypes.find(mt => mt.id === monster.type);
    if (!monsterTypeDef) return false;
    
    // Check if the monster has a lesser form defined
    if (!monsterTypeDef.lesser) return false;
    
    // Get the quest store to modify monsters
    const questStore = useQuestStore();
    
    // Make sure we have access to the current location
    const location = questStore.currentLocation;
    if (!location || !location.monsters) return false;
    
    // Find the original monster
    const monsterIndex = location.monsters.findIndex(m => m.id === monster.id);
    if (monsterIndex === -1) return false;
    
    // Save its item if it has one
    const originalItem = location.monsters[monsterIndex].item;
    
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
    
    // Ensure count is always at least 1
    count = Math.max(1, count);
    
    // Generate names based on count
    let names: string[] = [];
    if (count === 2) {
      // Use fun paired names for exactly 2 monsters
      const randomPairIndex = Math.floor(Math.random() * this.namePairs.length);
      const namePair = this.namePairs[randomPairIndex];
      names = [
        namePair[0].replace('{name}', monster.name), 
        namePair[1].replace('{name}', monster.name)
      ];
    } else {
      // Use numbering for 3+ monsters
      names = Array(count).fill(0).map((_, i) => `${monster.name} ${i + 1}`);
    }
    
    // Create the lesser monsters
    const newMonsters: Monster[] = [];
    for (let i = 0; i < count; i++) {
      const newMonster: Monster = {
        id: toMonsterId(`${monster.id}_lesser_${i}`),
        type: monsterTypeDef.lesser,
        name: names[i],
        alive: true
      };
      newMonsters.push(newMonster);
    }
    
    // If the original monster had an item, give it to a random new monster
    if (originalItem && newMonsters.length > 0) {
      const randomIndex = Math.floor(Math.random() * newMonsters.length);
      // Double-check that the monster at randomIndex exists before assigning the item
      if (newMonsters[randomIndex]) {
        newMonsters[randomIndex].item = originalItem;
      } else {
        // Fallback: give the item to the first monster if available
        if (newMonsters[0]) {
          newMonsters[0].item = originalItem;
        }
      }
    }
    
    // Add the new monsters to the location
    location.monsters.push(...newMonsters);
    
    // Remove the original monster
    location.monsters.splice(monsterIndex, 1);
    
    return true;
  }
} 
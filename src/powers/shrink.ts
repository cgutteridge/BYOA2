import type {Item, Monster } from '../types'
import { ItemPower } from './abstractItemPower'
import { monsterTypes } from '../data/monsterTypes'
import { useQuestStore } from '@/stores/questStore.ts'

/**
 * Shrink power implementation
 */
export class ShrinkPower extends ItemPower {
  // UI properties
  readonly displayName = "Shrink";
  readonly icon = "📏";
  readonly glowColor = "rgba(0, 128, 128, 0.8)";
  
  // Item generation constants
  readonly baseCost = 2;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = 'elite'; // Can target up to elite monsters
  
  // Item types for this power
  readonly itemTypes = ["Potion", "Elixir", "Flask", "Vial", "Phial", "Draught", "Brew"];

  // Funny name patterns for shrunken monsters
  private readonly shrinkNames = [
    'Little {name}',
    '{name} the Lesser',
    'Mini {name}',
    'Tiny {name}',
    'Pocket {name}',
    '{name} Jr.',
    'Wee {name}',
    'Itty Bitty {name}',
    '{name} (Compact Edition)',
    'Fun-Size {name}',
    'Travel-Size {name}',
    'Shrunk {name}',
    '{name} Lite',
    'Half-Pint {name}',
    'Diminutive {name}',
    'Micro {name}',
    '{name} the Small',
    'Shrunken {name}',
    'Bite-Size {name}',
    '{name} the Reduced'
  ];

  /**
   * Apply the shrink effect to a monster, transforming it to its lesser form
   * @param item The item being used
   * @param monster The monster to shrink
   * @returns Whether the operation was successful
   */
  applyEffect(item: Item, monster: Monster): boolean {
    const questStore = useQuestStore();

    // Get the monster's type definition
    const monsterTypeDef = monsterTypes.find(mt => mt.id === monster.type);
    if (!monsterTypeDef) return false;
    
    // Check if the monster has a lesser form defined
    if (!monsterTypeDef.lesser) return false;

    const originalName = monster.name

    // Generate a fun name for the shrunken monster
    const randomNameIndex = Math.floor(Math.random() * this.shrinkNames.length);
    monster.name = this.shrinkNames[randomNameIndex].replace('{name}', monster.name);

    monster.type = monsterTypeDef.lesser

    // Log the banishment
    questStore.updateStats(1,0,0,
        `${originalName} was shrunk down to size with ${item.name}`)

    return true;
  }

  generateEffectDescription(item: Item): string {
    const qualityTerm = this.getLevelQualityTerm(item.level);
    return `This ${qualityTerm} item reduces the power of ${this.getTargetDescription(item)}.`;
  }
} 
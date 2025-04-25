import type {Item, Monster, MonsterType} from '../types'
import { ItemPower } from './abstractItemPower'
import { monsterTypes } from '../data/monsterTypes'
import { useQuestStore } from '@/stores/questStore.ts'
import { generateRandomItem } from '@/quest/generateRandomItem'

/**
 * Grow power implementation
 */
export class GrowPower extends ItemPower {
  // UI properties
  readonly displayName = "Grow";
  readonly icon = "📈";
  readonly glowColor = "rgba(128, 0, 128, 0.8)";
  
  // Item generation constants
  readonly baseCost = 3;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = 'elite'; // Can target up to elite monsters
  readonly minLevel = 'minion';

  readonly itemTargetType = 'monsters';

  // Item types for this power
  readonly itemArtifactNames = ["Fertilizer", "Enhancer", "Amplifier", "Augment", "Booster", "Stimulant", "Mutagen"];

  // Funny name patterns for grown monsters
  private readonly growNames = [
    'Mighty {name}',
    '{name} the Greater',
    'Mega {name}',
    'Giant {name}',
    'Supreme {name}',
    '{name} Sr.',
    'Grand {name}',
    'Massive {name}',
    '{name} (Deluxe Edition)',
    'King-Size {name}',
    'Expanded {name}',
    '{name} Prime',
    '{name} Max',
    'Enhanced {name}',
    'Colossal {name}',
    'Macro {name}',
    '{name} the Great',
    'Empowered {name}',
    'Jumbo {name}',
    '{name} the Augmented'
  ];

  canTargetMonsterType(item: Item, monsterType: MonsterType): boolean {
    // Check if there are any monsters in the list that have this as their lesser form
    const hasHigherForm = monsterTypes.some(mt => 
      mt.lesser !== undefined && mt.lesser === monsterType.id
    );
    
    if (!hasHigherForm) {
      return false;
    }
    return super.canTargetMonsterType(item, monsterType);
  }

  /**
   * Apply the grow effect to a monster, transforming it to its higher form
   * @param item The item being used
   * @param monster The monster to grow
   * @returns Whether the operation was successful
   */
  applyEffect(item: Item, monster: Monster): boolean {
    const questStore = useQuestStore();

    // Get the monster's type definition
    const monsterTypeDef = monsterTypes.find(mt => mt.id === monster.type);
    if (!monsterTypeDef) return false;
    
    // Find any monster type that has this as its lesser form
    const higherForm = monsterTypes.find(mt => mt.lesser === monsterTypeDef.id);
    if (!higherForm) return false;

    const originalName = monster.name;
    const originalType = monsterTypeDef;

    // Generate a fun name for the grown monster
    const randomNameIndex = Math.floor(Math.random() * this.growNames.length);
    monster.name = this.growNames[randomNameIndex].replace('{name}', monster.name);

    // Transform the monster to its higher form
    monster.type = higherForm.id;

    // Give the grown monster a power item based on its new level
    if (originalType.level === 'grunt' && higherForm.level === 'elite') {
      // Generate a random item with power level 8 (transcendent) for elite
      monster.item = generateRandomItem(8);
    } else if (originalType.level === 'elite' && higherForm.level === 'boss') {
      // Generate a random item with power level 10 (cosmic) for boss
      monster.item = generateRandomItem(10);
    }

    // Log the transformation
    questStore.logAndNotifyQuestEvent(
        `${originalName} grew into ${monster.name} with ${item.name}`, { xp: 2 }
    );

    return true;
  }

  generateEffectDescription(item: Item): string {
    return `Enhance the power of ${this.getTargetDescription(item)}.`;
  }
} 
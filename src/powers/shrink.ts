import type {Item, Monster, MonsterType} from '../types'
import { ItemPower } from './abstractItemPower'
import { monsterTypeById } from '../data/monsterTypesLoader'
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
  readonly generateWeight = 12;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = 'elite'; // Can target up to elite monsters
  readonly minLevel = 'grunt';

  readonly itemTargetType = 'monsters';

  // Item types for this power
  readonly itemArtifactNames = ["Potion", "Elixir", "Flask", "Vial", "Phial", "Draught", "Brew"];

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

  canTargetMonsterType(item: Item, monsterType: MonsterType): boolean {
    // can't target monsters with no lesser form
    if( monsterType.lesser === undefined ) {
      return false
    }
    return super.canTargetMonsterType(item, monsterType);
  }

  /**
   * Apply the shrink effect to a monster, transforming it to its lesser form
   * @param item The item being used
   * @param monster The monster to shrink
   * @returns Whether the operation was successful
   */
  applyEffect(item: Item, monster: Monster): boolean {
    const questStore = useQuestStore();

    // Get the monster's type definition
    const monsterTypeDef = monsterTypeById(monster.type);
    
    // Check if the monster has a lesser form defined
    if (!monsterTypeDef.lesser) return false;

    const originalName = monster.name

    // Generate a fun name for the shrunken monster
    const randomNameIndex = Math.floor(Math.random() * this.shrinkNames.length);
    monster.name = this.shrinkNames[randomNameIndex].replace('{name}', monster.name);

    monster.type = monsterTypeDef.lesser

    // Log the banishment
    questStore.logAndNotifyQuestEvent(
        `${originalName} was shrunk down to size with ${item.name}`, { xp: 1 }
    )

    return true;
  }

  generateEffectDescription(item: Item): string {
    return `Reduce the power of ${this.getTargetDescription(item)}.`;
  }
} 
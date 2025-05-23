import type { Item } from '../types'
import { ItemPower } from './abstractItemPower'
import { useQuestStore } from '@/stores/questStore'

/**
 * ScoutRange power implementation - increases the player's scout range
 */
export class ScoutRangePower extends ItemPower {
  // UI properties
  readonly displayName = "Range Extender";
  readonly icon = "🔭";
  readonly glowColor = "rgba(0, 191, 255, 0.8)";
  
  // Item generation constants
  readonly baseCost = 1;
  readonly generateWeight = 12;
  readonly canHaveTargetRestriction = false;
  readonly supportsTypeTargeting = false;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = null; // Can target any level

  readonly itemTargetType = 'special';

  // Item types for this power
  readonly itemArtifactNames = ["Telescope", "Spy Drone", "Winged Monkey", "Binoculars", "Periscope", "Eagle Eye"];

  // don't close the inventory after generating something
  readonly afterUse = (_item:Item)=>{}

  useWithoutTarget(item: Item): boolean {
    const extendSize = 20*item.uses
    const questStore = useQuestStore();

    // Extend scout range by 20 meters per use left
    questStore.setScoutRange(questStore.scoutRange + extendSize);
    questStore.logAndNotifyQuestEvent(
        `Used ${item.name} ${item.uses>1?item.uses+' times ':''}to increase maximum scout range by ${extendSize}m.`,
        { xp: 10*item.uses }
    )
    this.reduceUses(item, item.uses);
    return true;
  }
  
  generateEffectDescription(item: Item): string {
    return `Extend your scout range by ${item.uses*20} meters.`;
  }
} 
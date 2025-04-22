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
  readonly canHaveTargetRestriction = false;
  readonly supportsTypeTargeting = false;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = null; // Can target any level

  readonly itemTargetType = 'special';

  // Item types for this power
  readonly itemArtifactNames = ["Telescope", "Spy Drone", "Winged Monkey", "Binoculars", "Periscope", "Eagle Eye"];

  useWithoutTarget(item: Item): boolean {
    const extendSize = 20*item.uses
    const questStore = useQuestStore();

    // Extend scout range by 20 meters per use left
    questStore.setScoutRange(questStore.scoutRange + extendSize);
    questStore.logAndNotifyQuestEvent(10*item.uses,0,0,
        `Used ${item.name} ${item.uses>1?item.uses+' times ':''}to increase maximum scout range by ${extendSize}m.`)
    this.reduceUses(item, item.uses);
    return true;
  }
  
  generateEffectDescription(item: Item): string {
    const qualityTerm = this.getLevelQualityTerm(item.level);
    return `This ${qualityTerm} item extends your scout range by 20 meters each time it's used.`;
  }
} 
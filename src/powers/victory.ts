import type {Item} from '../types'
import {ItemPower} from './abstractItemPower';
import {useAppStore} from '@/stores/appStore';
import {useQuestStore} from '@/stores/questStore';

/**
 * Victory power implementation - quest completion item
 */
export class VictoryPower extends ItemPower {
  // UI properties
  readonly displayName = "Victory";
  readonly icon = "🏆";
  readonly glowColor = "rgba(255, 215, 0, 0.8)";
  
  // Item generation constants
  readonly baseCost = 100; // prevent generation
  readonly canHaveTargetRestriction = false;
  readonly supportsTypeTargeting = false;
  readonly canHaveResultRestriction = false;
  readonly maxLevel = null; // Can target any level

  readonly itemTargetType = 'special';

  // Item types for this power
  readonly itemArtifactNames = ["Trophy", "Crown", "Chalice", "Medal"];

  useWithoutTarget(_item: Item): boolean {
    const appStore = useAppStore();
    const questStore = useQuestStore();

    // Log the victory
    questStore.logAndNotifyQuestEvent(
      `Quest Complete`
    );

    // Transition to victory screen
    appStore.setScreen('victory');

    return true;
  }
  
  generateEffectDescription(_item: Item): string {
    return 'This is the thing you\'ve been after. Well done. YOU WIN!';
  }
} 
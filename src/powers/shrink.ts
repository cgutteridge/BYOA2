import type { Item, MonsterTypeId, MonsterLevel } from '../types'
import { ItemPower, PowerResult } from './abstractItemPower'

/**
 * Shrink power implementation - converts boss monsters to elite and elite to grunt
 * Can also convert grunts to minions
 */
export class ShrinkPower extends ItemPower {
  // UI properties
  readonly displayName = "Shrink";
  readonly icon = "📏";
  readonly glowColor = "rgba(255, 192, 203, 0.8)"; // Pink glow
  
  // Direct property declarations
  readonly baseCost = 2;
  readonly canHaveTargetRestriction = true;
  readonly supportsTypeTargeting = true;
  readonly defaultTargetMode = 'random';
  readonly canHaveResultRestriction = false;
  readonly levelRestrictions: MonsterLevel[] = ['grunt', 'elite', 'boss'];

} 
import type { ItemPowerId } from '../types'
import { ItemPower } from './types'
import { BanishPower } from './banish'
import { KillPower } from './kill'
import { SpyPower } from './spy'
import { ShrinkPower } from './shrink'
import { SplitPower } from './split'
import { TransmutePower } from './transmute'
import { PickpocketPower } from './pickpocket'
import { FreezePower } from './freeze'

// Create instances of the power classes
const banishPower = new BanishPower();
const killPower = new KillPower();
const spyPower = new SpyPower();
const transmutePower = new TransmutePower();
const shrinkPower = new ShrinkPower();
const splitPower = new SplitPower();
const pickpocketPower = new PickpocketPower();
const freezePower = new FreezePower();

// Register all power implementations
const powerInstances: Record<ItemPowerId, ItemPower> = {
  banish: banishPower,
  kill: killPower,
  spy: spyPower,
  transmute: transmutePower,
  shrink: shrinkPower,
  split: splitPower,
  pickpocket: pickpocketPower,
  freeze: freezePower
};

/**
 * Simplified power factory implementation
 * Just retrieves a power instance by name
 */
export const powerFactory = {
  /**
   * Get a power instance by name
   */
  getPower: (powerName: ItemPowerId): ItemPower | undefined => {
    return powerInstances[powerName];
  }
} 
import type { ItemPowerId } from '../types'
import { ItemPower } from './abstractItemPower'
import { BanishPower } from './banish'
import { KillPower } from './kill'
import { SpyPower } from './spy'
import { ShrinkPower } from './shrink'
import { SplitPower } from './split'
import { TransmutePower } from './transmute'
import { PickpocketPower } from './pickpocket'
import { FreezePower } from './freeze'
import { PetrifyPower } from './petrify'
import { PacifyPower } from './pacify'
import { DistractPower } from './distract'
import { VegetatePower } from './vegetate'
import { StunPower } from './stun'
import { TokenPower } from './token'
import { VictoryPower} from "@/powers/victory.ts";
import { ScoutRangePower } from './scoutRange'
import { LootboxPower } from './lootbox.ts'

// Create instances of the power classes
const banishPower = new BanishPower();
const killPower = new KillPower();
const spyPower = new SpyPower();
const transmutePower = new TransmutePower();
const shrinkPower = new ShrinkPower();
const splitPower = new SplitPower();
const pickpocketPower = new PickpocketPower();
const freezePower = new FreezePower();
const petrifyPower = new PetrifyPower();
const pacifyPower = new PacifyPower();
const distractPower = new DistractPower();
const vegetatePower = new VegetatePower();
const stunPower = new StunPower();
const tokenPower = new TokenPower();
const victoryPower = new VictoryPower();
const scoutRangePower = new ScoutRangePower();
const lootboxPower = new LootboxPower();

// Register all power implementations
const powerInstances: Record<ItemPowerId, ItemPower> = {
  banish: banishPower,
  kill: killPower,
  spy: spyPower,
  transmute: transmutePower,
  shrink: shrinkPower,
  split: splitPower,
  pickpocket: pickpocketPower,
  freeze: freezePower,
  petrify: petrifyPower,
  pacify: pacifyPower,
  distract: distractPower,
  vegetate: vegetatePower,
  stun: stunPower,
  token: tokenPower,
  victory: victoryPower,
  scoutRange: scoutRangePower,
  lootbox: lootboxPower,
};

export const allPowers : ItemPower[] = Object.values(powerInstances);

export const allPowerIds : ItemPowerId[] = Object.keys(powerInstances) as ItemPowerId[];

/**
 * Simplified power factory implementation
 * Just retrieves a power instance by name
 */
export const powerFactory = {
  /**
   * Get a power instance by name
   */
  getPower: (powerName: ItemPowerId): ItemPower  => {
    return powerInstances[powerName];
  }
} 
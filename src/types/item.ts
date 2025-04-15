import type { MonsterLevel, Species, MonsterFlag } from './index';

// Item power types
export type ItemPower = 
  | 'kill' 
  | 'transmute' 
  | 'spy'
  | 'shrink' 
  | 'split' 
  | 'pickpocket'
  | 'banish'
  | 'freeze';  // Removes monster without getting any loot

// Target modes - how the target is selected
export type TargetMode = 'random' | 'pick' | 'random_type' | 'pick_type' | 'location' | undefined;

// Result modes
export type ResultMode = 'random' | 'pick' | 'random_type' | 'chosen_type' | undefined;

// Unified Item interface
export interface Item {
  id: string
  name: string
  description?: string  // A brief description of what the item does
  uses: number
  level: number
  power: ItemPower
  target?: TargetMode
  targetFilters?: {
    species?: Species[]
    levels?: MonsterLevel[]
    flags?: MonsterFlag[]
  }
  result?: ResultMode
  resultLevel?: MonsterLevel
  resultSpecies?: Species
  icon?: string
  timestamp?: number  // To track when the item was added or updated
} 
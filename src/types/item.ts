import { MonsterFlag, MonsterLevel, Species } from '.'

// Item power types
export type ItemPower = 
  | 'kill' 
  | 'transmute' 
  | 'scout_500' 
  | 'scout_1000' 
  | 'scout_any' 
  | 'shrink' 
  | 'split' 
  | 'pickpocket'
  | 'banish';  // Removes monster without getting any loot

// Target modes - how the target is selected
export type TargetMode = 'pick' | 'random' | undefined;

// Target scopes - what is targeted
export type TargetScope = 'one' | 'type' | 'race' | 'all' | undefined;

// Result modes
export type ResultMode = 'random' | 'pick' | 'level' | 'species' | undefined;

// Unified Item interface
export interface Item {
  id: string
  name: string
  description: string  // A brief description of what the item does
  uses: number
  level: number
  power: ItemPower
  target?: TargetMode
  targetScope?: TargetScope
  targetFilters?: {
    species?: Species[]
    levels?: MonsterLevel[]
    flags?: MonsterFlag[]
  }
  result?: ResultMode
  resultLevel?: MonsterLevel
  resultSpecies?: Species
  icon?: string
  quantity?: number  // For inventory tracking
} 
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
export type TargetMode = 'random' | 'pick' | 'random_type' | 'pick_type' | undefined;

// Result modes
export type ResultMode = 'random' | 'pick' | undefined;

// Unified Item interface
export interface Item {
  id: string
  name: string
  description?: string  // A brief description of what the item does
  effectDescription?: string  // A simple description of the effect that explains what the item does
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
  quantity?: number  // For inventory tracking
} 
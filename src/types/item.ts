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
  | 'pickpocket';

// Target modes - how the target is selected
export type TargetMode = 'pick' | 'random' | undefined;

// Target scopes - what is targeted
export type TargetScope = 'one' | 'type' | 'race' | 'all' | undefined;

// Result modes
export type ResultMode = 'random' | 'pick' | 'level' | 'species' | undefined;

// Enhanced Item interface
export interface EnhancedItem {
  id: string
  name: string
  description: string
  story?: string
  uses?: number
  power?: ItemPower
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
}

// Item type for the inventory system
export interface InventoryItem extends EnhancedItem {
  quantity: number
} 
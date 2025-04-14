import { MonsterFlag, MonsterLevel, Species } from '.'

// Item power types
export type ItemPower = 
  | 'kill_one' 
  | 'kill_all' 
  | 'transmute_one' 
  | 'transmute_all' 
  | 'scout_500' 
  | 'scout_1000' 
  | 'scout_any' 
  | 'shrink' 
  | 'split' 
  | 'pickpocket';

// Target and result modes
export type TargetMode = 'pick' | 'random' | undefined;
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
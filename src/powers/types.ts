import type { EnhancedItem } from '../types/item'
import type { Monster } from '../types'

// Base interface for all power functions
export interface PowerFunction {
  execute: (item: EnhancedItem, target?: Monster | string | any) => void
  canTarget: (item: EnhancedItem, target?: Monster | string | any) => boolean
  getValidTargets?: (item: EnhancedItem) => Monster[] | string[] | any[]
  getTargetDescription: (item: EnhancedItem) => string
}

// Result type for power executions
export interface PowerResult {
  success: boolean
  message: string
  targets?: Monster[] | string[]
  affectedItems?: EnhancedItem[]
} 
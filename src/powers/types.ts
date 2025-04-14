import type { Item } from '../types/item'
import type { Monster } from '../types'

// Base interface for all power functions
export interface PowerFunction {
  execute: (item: Item, target?: Monster | string | any) => void
  canTarget: (item: Item, target?: Monster | string | any) => boolean
  getValidTargets?: (item: Item) => Monster[] | string[] | any[]
  getTargetDescription: (item: Item) => string
}

// Result type for power executions
export interface PowerResult {
  success: boolean
  message: string
  targets?: Monster[] | string[]
  affectedItems?: Item[]
} 
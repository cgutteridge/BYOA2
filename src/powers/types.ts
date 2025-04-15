import type { Item } from '../types/item'
import type { Monster, Pub } from '../types'

// Base interface for all power functions
export interface PowerFunction {
  execute: (item: Item, target?: Monster | Pub | string | any) => void
  canTarget: (item: Item, target?: Monster | Pub | string | any) => boolean
  getValidTargets: (item: Item, targets: Monster[] | Pub[] | any[]) => Monster[] | Pub[] | string[] | any[]
  displayName?: string
  icon?: string
  glowColor?: string
}

// Power factory to provide UI properties and functionality
export interface PowerFactory {
  getPowerFunction: (powerName: string) => PowerFunction | undefined
  getIcon: (powerName: string) => string
  getGlowColor: (powerName: string) => string
  getDisplayName: (powerName: string) => string
}

// Result type for power executions
export interface PowerResult {
  success: boolean
  message: string
  targets?: Monster[] | Pub[] | string[]
  affectedItems?: Item[]
} 
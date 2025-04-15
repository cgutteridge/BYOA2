import type { Monster } from '../../types'

/**
 * Checks if a value is a Monster object
 */
export function isMonster(value: any): value is Monster {
  return (
    value !== null &&
    typeof value === 'object' &&
    'type' in value &&
    'alive' in value &&
    'name' in value
  )
}

/**
 * Checks if a value is a Monster array
 */
export function isMonsterArray(value: any[]): value is Monster[] {
  return value.length === 0 || isMonster(value[0])
}

/**
 * Checks if a value is a Monster type string
 */
export function isMonsterType(value: any): value is string {
  return typeof value === 'string'
}

/**
 * Safely casts an array to Monster array, filtering out non-Monster objects
 */
export function filterToMonsterArray(targets: any[]): Monster[] {
  return targets.filter(target => isMonster(target)) as Monster[]
} 
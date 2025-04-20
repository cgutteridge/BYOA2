import type { Item } from '../types';
import { powerFactory } from '@/powers';

/**
 * Convert item level to descriptive quality term
 */
export function getLevelQualityTerm(level: number): string {
  switch (level) {
    case 1: return "crap";
    case 2: return "mediocre";
    case 3: return "decent";
    case 4: return "superior";
    case 5: return "excellent";
    case 6: return "legendary";
    default: return "unknown quality";
  }
}

/**
 * Get a description of the item's target options
 */
export function getTargetDescription(item: Item): string {
  // Handle empty or undefined item objects
  if (!item || typeof item !== 'object') {
    return 'an unknown enemy';
  }
  
  let filterDescription = '';
  let selectionMethod = '';
  
  // Add target filters if present
  if (item.targetFilters) {
    const filters = [];
    
    if (item.targetFilters.flags && item.targetFilters.flags.length > 0) {
      filters.push(item.targetFilters.flags.join('/'));
    }

    if (item.maxLevel) {
      filters.push(item.maxLevel);
    }
    
    if (item.targetFilters.species && item.targetFilters.species.length > 0) {
      filters.push(item.targetFilters.species.join('/'));
    }
    
    if (filters.length > 0) {
      filterDescription += filters.join(', ');
    }
  }

  // Determine selection method based on target mode
  if (item.target === 'pick' || item.target === 'pick_type') {
    selectionMethod = 'chosen';
  } else {
    selectionMethod = 'random';
  }
  
  // Type vs single target based on target mode
  if (item.target === 'random_type' || item.target === 'pick_type') {
    return `all ${filterDescription} enemies of one ${selectionMethod} type`;
  }
  
  return `a ${selectionMethod} ${filterDescription} enemy`;
}

/**
 * Get a description of the item's result for transmutation
 */
export function getResultDescription(item: Item): string {
  if (item.power !== 'transmute' || !item.result) return '';
  
  let effect = '';
  
  switch (item.result) {
    case 'random':
      effect += "a random enemy of the same level";
      break;
    case 'pick':
      effect += "a chosen enemy of the same level";
      break;
  }
  
  return effect;
}

/**
 * Generate a clear effect description for the item
 */
export function generateEffectDescription(item: Item): string {
  if (!item.power) return "Does nothing special.";
  
  // Get the power implementation and delegate to its description generator
  const power = powerFactory.getPower(item.power);
  if (power) {
    return power.generateEffectDescription(item);
  }
  
  // Fallback in case the power is not found
  const qualityTerm = getLevelQualityTerm(item.level);
  return `This ${qualityTerm} item has unknown effects.`;
} 
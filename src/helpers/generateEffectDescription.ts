import type { Item } from '../types/item';

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
 * Get a description of the item's uses
 */
export function getUsesDescription(item: Item): string {
  if (!item.uses) return '';
  return ` Has ${item.uses} ${item.uses === 1 ? 'use' : 'uses'} remaining.`;
}

/**
 * Get a description of the item's target options
 */
export function getTargetDescription(item: Item): string {
  let effect = '';
  
  // Add targeting scope
  if (item.targetScope) {
    switch (item.targetScope) {
      case 'one':
        effect += " a single monster";
        break;
      case 'type':
        effect += " all monsters of the same type in the current location";
        break;
    }
  } else {
    effect += " a single monster";
  }
  
  // Add target filters if present
  if (item.targetFilters) {
    const filters = [];
    
    if (item.targetFilters.levels && item.targetFilters.levels.length > 0) {
      filters.push(`${item.targetFilters.levels.join('/')} level`);
    }
    
    if (item.targetFilters.species && item.targetFilters.species.length > 0) {
      filters.push(`${item.targetFilters.species.join('/')} species`);
    }
    
    if (item.targetFilters.flags && item.targetFilters.flags.length > 0) {
      filters.push(`${item.targetFilters.flags.join('/')} type`);
    }
    
    if (filters.length > 0) {
      effect += ` (works on ${filters.join(', ')})`;
    }
  }
  
  return effect;
}

/**
 * Get a description of the item's result for transmutation
 */
export function getResultDescription(item: Item): string {
  if (item.power !== 'transmute' || !item.result) return '';
  
  let effect = '';
  
  switch (item.result) {
    case 'random':
      effect += " Transforms target into a random monster of the same level.";
      break;
    case 'pick':
      effect += " User chooses what monster to transform target into (same level).";
      break;
  }
  
  return effect;
}

/**
 * Generate a clear effect description for the item
 */
export function generateEffectDescription(item: Item): string {
  if (!item.power) return "Does nothing special.";
  
  const qualityTerm = getLevelQualityTerm(item.level);
  let effect = "";
  
  // Base effect by power type
  switch (item.power) {
    case 'kill':
      effect = `This ${qualityTerm} item instantly defeats`;
      effect += getTargetDescription(item);
      effect += ".";
      break;
      
    case 'transmute':
      effect = `This ${qualityTerm} item transforms`;
      effect += getTargetDescription(item);
      effect += ".";
      effect += getResultDescription(item);
      break;
      
    case 'shrink':
      effect = `This ${qualityTerm} item reduces the power of`;
      effect += getTargetDescription(item);
      effect += ".";
      break;
      
    case 'split':
      effect = `This ${qualityTerm} item splits`;
      effect += getTargetDescription(item);
      effect += ".";
      break;
      
    case 'pickpocket':
      effect = `This ${qualityTerm} item steals from`;
      effect += getTargetDescription(item);
      effect += ".";
      break;
      
    case 'banish':
      effect = `This ${qualityTerm} item banishes`;
      effect += getTargetDescription(item);
      effect += ".";
      break;
      
    case 'scout_500':
      effect = `This ${qualityTerm} item reveals any location within 500 meters.`;
      break;
      
    case 'scout_1000':
      effect = `This ${qualityTerm} item reveals any location within 1000 meters.`;
      break;
      
    case 'scout_any':
      effect = `This ${qualityTerm} item reveals any location.`;
      break;
      
    default:
      effect = `This ${qualityTerm} item has unknown effects.`;
  }
  
  // Add number of uses
  effect += getUsesDescription(item);
  
  return effect;
} 
import type { Item } from '../types';

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
      // Convert maxLevel to appropriate description
      const levelDescriptions = {
        'minion': 'minion',
        'grunt': 'minion/grunt',
        'elite': 'minion/grunt/elite',
        'boss': 'minion/grunt/elite/boss'
      };
      filters.push(levelDescriptions[item.maxLevel]);
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
  
  const qualityTerm = getLevelQualityTerm(item.level);
  let effect = "";
  
  // Base effect by power type
  switch (item.power) {
    case 'kill':
      effect = `This ${qualityTerm} item instantly defeats `;
      effect += getTargetDescription(item);
      effect += ".";
      break;
      
    case 'transmute':
      effect = `This ${qualityTerm} item transforms `;
      effect += getTargetDescription(item);
      effect += " into ";
      effect += getResultDescription(item);
      effect += ".";
      break;
      
    case 'shrink':
      effect = `This ${qualityTerm} item reduces the power of `;
      effect += getTargetDescription(item);
      effect += ".";
      break;
      
    case 'split':
      effect = `This ${qualityTerm} item splits `;
      effect += getTargetDescription(item);
      effect += " into multiple but weaker enemies.";
      break;
      
    case 'pickpocket':
      effect = `This ${qualityTerm} item steals from `;
      effect += getTargetDescription(item);
      effect += ".";
      break;
      
    case 'banish':
      effect = `This ${qualityTerm} item banishes `;
      effect += getTargetDescription(item);
      effect += ".";
      break;
      
    case 'spy':
      effect = `This ${qualityTerm} item reveals any location without visiting it.`;
      break;
      
    case 'freeze':
      effect = `This ${qualityTerm} item transforms `;
      effect += getTargetDescription(item);
      effect += " into an ice monster of the same level.";
      break;
      
    case 'petrify':
      effect = `This ${qualityTerm} item transforms `;
      effect += getTargetDescription(item);
      effect += " into a stone monster of the same level.";
      break;
      
    case 'pacify':
      effect = `This ${qualityTerm} item transforms `;
      effect += getTargetDescription(item);
      effect += " into a water-based pacified monster of the same level.";
      break;
      
    case 'distract':
      effect = `This ${qualityTerm} item transforms `;
      effect += getTargetDescription(item);
      effect += " into a distracted monster of the same level.";
      break;
      
    case 'vegetate':
      effect = `This ${qualityTerm} item transforms `;
      effect += getTargetDescription(item);
      effect += " into a vegetated monster of the same level.";
      break;
      
    case 'stun':
      effect = `This ${qualityTerm} item transforms `;
      effect += getTargetDescription(item);
      effect += " into a stunned monster of the same level.";
      break;
      
    default:
      effect = `This ${qualityTerm} item has unknown effects.`;
  }

  return effect;
} 
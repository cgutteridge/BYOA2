import { toItemId, Item, ItemPowerId } from '../types';
import { allPowerIds, powerFactory } from '@/powers';

/**
 * Helper function to create a debug item for a specific power
 */
function createDebugItem(powerId: ItemPowerId, items: Item[]): void {
  // Get power instance
  const power = powerFactory.getPower(powerId);

  // Create pick item (use on individual monster/target)
  const pickItem: Item = {
    id: toItemId(`debug_pick_${powerId}_${Date.now()}`),
    name: `DEBUG ${power.displayName}`,
    description: `Debug item with unrestricted ability to ${powerId}`,
    uses: 999,
    level: 6,
    power: powerId,
    target: 'pick',
    targetFilters: {},
    maxLevel: 'boss',
    timestamp: Date.now()
  };
  items.push(pickItem);

  // Only create pick_type item for powers that work on monsters
  if (power.itemTargetType === 'monsters' && power.supportsTypeTargeting) {
    // Create pick_type item (use on monster type)
    const pickTypeItem: Item = {
      id: toItemId(`debug_pick_type_${powerId}_${Date.now()}`),
      name: `DEBUG ${power.displayName} (Use on Type)`,
      description: `Debug item with unrestricted ability to ${powerId} all monsters of a type`,
      uses: 999,
      level: 6,
      power: powerId,
      target: 'pick_type',
      targetFilters: {},
      maxLevel: 'boss',
      timestamp: Date.now()
    };
    items.push(pickTypeItem);
  }
}

/**
 * Create debug items for testing
 * @returns An array of debug items
 */
export function createDebugItems(): Item[] {
  const debugItems: Item[] = [];

  // Add all available powers for debugging
  allPowerIds.forEach(powerId => {
    // Skip the ones we already added
    if (['spy', 'kill', 'randomItem'].includes(powerId)) return;

    createDebugItem(powerId, debugItems);
  });

  return debugItems;
} 
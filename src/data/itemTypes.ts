// This file is now a re-export wrapper for backwards compatibility
// All data is loaded from JSON using the itemPowers loader
import { itemPowers, itemPowersById } from './itemPowersLoader';
import { ItemType, ItemPower, ItemPowerMetadata } from '../types';

// Compatibility layer to maintain backward compatibility
export const itemTypes: ItemType[] = itemPowers.map((power: ItemPowerMetadata) => ({
  id: power.id,
  title: power.title,
  power: power.id, // Map id to power for backward compatibility
  level: power.level
}));

// Backward compatibility map
export const itemTypesByPower: Record<ItemPower, ItemType> = Object.entries(itemPowersById)
  .reduce((acc, [key, value]) => {
    acc[key as ItemPower] = {
      id: value.id,
      title: value.title,
      power: value.id,
      level: value.level
    };
    return acc;
  }, {} as Record<ItemPower, ItemType>); 
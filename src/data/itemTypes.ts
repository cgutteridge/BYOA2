// This file is a compatibility layer that uses the powers directory
// as the source of truth for item power data
import { powerFactory } from '../powers';
import { ItemType, ItemPowerId } from '../types';

// Build a list of all available power keys
// These are the keys used in the powerClasses record in powers/index.ts
const powerKeys: ItemPowerId[] = [
  'kill',
  'spy',
  'banish',
  'transmute',
  'shrink',
  'split',
  'pickpocket',
  'freeze'
];

// Get power display name for the title
const displayName = (powerKey: ItemPowerId): string => {
  const power = powerFactory.getPower(powerKey);
  return power?.displayName || powerKey;
};

// Compatibility layer to maintain backward compatibility
export const itemTypes: ItemType[] = powerKeys.map(powerKey => ({
  id: powerKey,
  title: displayName(powerKey),
  power: powerKey,
  level: 1 // Default level is 1
}));

// Backward compatibility map
export const itemTypesByPower: Record<ItemPowerId, ItemType> = powerKeys.reduce((acc, powerKey) => {
  acc[powerKey] = {
    id: powerKey,
    title: displayName(powerKey),
    power: powerKey,
    level: 1 // Default level is 1
  };
  return acc;
}, {} as Record<ItemPowerId, ItemType>); 
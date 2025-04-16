import itemPowersData from './itemPowers.json';
import { ItemPower, ItemPowerMetadata } from '../types';

// Type for the raw JSON data
interface RawItemPowerData {
  id: string;
  title: string;
  level: number;
}

// Parse the JSON data
export const itemPowers: ItemPowerMetadata[] = (itemPowersData as RawItemPowerData[]).map(power => ({
  ...power,
  id: power.id as ItemPower
}));

// Create lookup map by power ID
export const itemPowersById: Record<ItemPower, ItemPowerMetadata> = 
  itemPowers.reduce((acc, power) => {
    acc[power.id] = power;
    return acc;
  }, {} as Record<ItemPower, ItemPowerMetadata>); 
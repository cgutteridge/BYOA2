import { Coordinates } from '@/types';
import calculateDistance from './calculateDistance';
import formatDistance from './formatDistance';
import { useAppStore } from '@/stores/appStore';

interface PickerOption {
  id?: string | number
  name?: string
  title?: string
  label?: string
  subtitle?: string
  count?: number
  disabled?: boolean
  coordinates?: Coordinates
  [key: string]: any
}

/**
 * Format a location's subtitle with distance from player
 * @param option The location option to format
 * @returns Formatted subtitle string
 */
export function formatLocationSubtitle(option: PickerOption): string {
  const appStore = useAppStore();
  
  if (!appStore.playerCoordinates || !option.coordinates) {
    return '';
  }
  
  const distance = calculateDistance(appStore.playerCoordinates, option.coordinates);
  return formatDistance(distance);
} 
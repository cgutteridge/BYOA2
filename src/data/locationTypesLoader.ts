import locationsData from './locationTypes.json';
import { GameLocationType, GameLocationTypeId, toGameLocationTypeId } from '../types';

// Parse the JSON data and apply the proper branded type to each ID
export const locationTypes: GameLocationType[] = locationsData.map(location => ({
  ...location,
  id: toGameLocationTypeId(location.id),
  size: location.size as [number, number],
  anchor: location.anchor as [number, number],
  shadowAnchor: location.shadowAnchor as [number, number],
  shadowSize: location.shadowSize as [number, number]
}));

export const locationTypesList: GameLocationTypeId[] = locationTypes.map(locationType => locationType.id);

export const locationTypesById: Record<GameLocationTypeId, GameLocationType> = locationTypes.reduce((acc, locationType) => {
  acc[locationType.id] = locationType;
  return acc;
}, {} as Record<GameLocationTypeId, GameLocationType>); 
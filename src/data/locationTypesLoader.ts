import gameLocationsData from './locationTypes.json';
import { GameLocationType, GameLocationTypeId, toGameLocationTypeId } from '../types';

// Parse the JSON data and apply the proper branded type to each ID
export const locationTypes: GameLocationType[] = gameLocationsData.map(gameLocation => ({
  ...gameLocation,
  id: toGameLocationTypeId(gameLocation.id)
}));

export const locationTypesList: GameLocationTypeId[] = locationTypes.map(gameLocationType => gameLocationType.id);

export const locationTypesById: Record<GameLocationTypeId, GameLocationType> = locationTypes.reduce((acc, gameLocationType) => {
  acc[gameLocationType.id] = gameLocationType;
  return acc;
}, {} as Record<GameLocationTypeId, GameLocationType>); 
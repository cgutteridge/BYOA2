import locationsData from './locationTypes.json';
import { LocationType, LocationTypeId, toLocationTypeId } from '../types';

// Parse the JSON data and apply the proper branded type to each ID
export const locationTypes: LocationType[] = locationsData.map(location => ({
  ...location,
  id: toLocationTypeId(location.id)
}));

export const locationTypesList: LocationTypeId[] = locationTypes.map(locationType => locationType.id);

export const locationTypesById: Record<LocationTypeId, LocationType> = locationTypes.reduce((acc, locationType) => {
  acc[locationType.id] = locationType;
  return acc;
}, {} as Record<LocationTypeId, LocationType>); 
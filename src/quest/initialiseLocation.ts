import {locationTypesList} from "@/data/locationTypes.ts";
import {LocationDifficulty, Location} from "@/types";
import {useQuestStore} from "@/stores/questStore.ts";
import {useLocationStore} from "@/stores/locationStore.ts";
import calculateDistance from "@/utils/calculateDistance.ts";
import {pickOne} from "@/utils/random.ts";

export default function initialiseLocation(location: Location) {
    const locationStore = useLocationStore()
    // calculate difficulty
    locationStore.setLocationDifficulty(location.id, calculateDifficulty(location))

    // set locationType
    locationStore.setLocationType(location.id, pickOne(locationTypesList))
}

function calculateDifficulty(location: Location) : LocationDifficulty{
    const questStore = useQuestStore()
    if(location.id === questStore.startLocation?.id) { return 'start'}
    if(location.id === questStore.endLocation?.id) { return 'end'}

    if(questStore.endLocation === undefined || questStore.startLocation === undefined) {
        // this should not actually happen but it keeps typescript quiet
        return 'medium'
    }
    // calculate distance to start and end location
    const distanceFromStart = calculateDistance(questStore.startLocation.lat,questStore.startLocation.lng,location.lat,location.lng)
    const distanceFromEnd = calculateDistance(questStore.endLocation.lat,questStore.endLocation.lng,location.lat,location.lng)
    const ratio = distanceFromStart / distanceFromEnd
    if(ratio<0.3) { return 'easy'}
    if(ratio>0.7) { return 'hard'}
    return 'medium'
}
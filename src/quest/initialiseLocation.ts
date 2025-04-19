import {GameLocationDifficulty, GameLocation} from "@/types";
import {useQuestStore} from "@/stores/questStore.ts";
import calculateDistance from "@/utils/calculateDistance.ts";
import pickOne from "@/utils/pickOne.ts";
import {useLocationStore} from "@/stores/locationStore.ts";
import {locationTypesList} from "@/data/locationTypes.ts";

export default function initialiseGameLocation(location: GameLocation) {
    const locationStore = useLocationStore()
    // calculate difficulty
    locationStore.setGameLocationDifficulty(location.id, calculateDifficulty(location))

    // set type
    locationStore.setGameLocationType(location.id, pickOne(locationTypesList))
}

function calculateDifficulty(location: GameLocation) : GameLocationDifficulty{
    const questStore = useQuestStore()
    if(location.id === questStore.startGameLocation?.id) { return 'start'}
    if(location.id === questStore.endGameLocation?.id) { return 'end'}

    if(questStore.endGameLocation === undefined || questStore.startGameLocation === undefined) {
        // this should not actually happen but it keeps typescript quiet
        return 'medium'
    }
    // calculate distance to start and end location
    const distanceFromStart = calculateDistance(questStore.startGameLocation.lat,questStore.startGameLocation.lng,location.lat,location.lng)
    const distanceFromEnd = calculateDistance(questStore.endGameLocation.lat,questStore.endGameLocation.lng,location.lat,location.lng)
    const ratio = distanceFromStart / distanceFromEnd
    if(ratio<0.3) { return 'easy'}
    if(ratio>0.7) { return 'hard'}
    return 'medium'
}
import {GameLocationDifficulty, GameLocation} from "@/types";
import {useQuestStore} from "@/stores/questStore.ts";
import calculateDistance from "@/utils/calculateDistance.ts";
import pickOne from "@/utils/pickOne.ts";
import {useLocationStore} from "@/stores/locationStore.ts";
import {locationTypesList} from "@/data/locationTypes.ts";

export default function initialiseGameLocation(gameLocation: GameLocation) {
    const locationStore = useLocationStore()
    // calculate difficulty
    locationStore.setGameLocationDifficulty(gameLocation.id, calculateDifficulty(gameLocation))

    // set type
    locationStore.setGameLocationType(gameLocation.id, pickOne(locationTypesList))
}

function calculateDifficulty(gameLocation: GameLocation) : GameLocationDifficulty{
    const questStore = useQuestStore()
    if(gameLocation.id === questStore.startGameLocation?.id) { return 'start'}
    if(gameLocation.id === questStore.endGameLocation?.id) { return 'end'}

    if(questStore.endGameLocation === undefined || questStore.startGameLocation === undefined) {
        // this should not actually happen but it keeps typescript quiet
        return 'medium'
    }
    // calculate distance to start and end gameLocation
    const distanceFromStart = calculateDistance(questStore.startGameLocation.lat,questStore.startGameLocation.lng,gameLocation.lat,gameLocation.lng)
    const distanceFromEnd = calculateDistance(questStore.endGameLocation.lat,questStore.endGameLocation.lng,gameLocation.lat,gameLocation.lng)
    const ratio = distanceFromStart / distanceFromEnd
    if(ratio<0.3) { return 'easy'}
    if(ratio>0.7) { return 'hard'}
    return 'medium'
}
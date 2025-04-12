import {locationTypesList} from "@/data/locationTypes.ts";
import {LocationDifficulty, Pub} from "@/types";
import pickOne from "@/helpers/pickOne.ts";
import {useQuestStore} from "@/stores/questStore.ts";
import {usePubStore} from "@/stores/pubStore.ts";
import calculateDistance from "@/helpers/calculateDistance.ts";


export default function initialisePub(pub: Pub) {
    const pubStore = usePubStore()
    // calculate difficulty
    pubStore.setPubDifficulty(pub.id, calculateDifficulty(pub))

    // set locationType
    pubStore.setPubType(pub.id, pickOne(locationTypesList))
}

function calculateDifficulty(pub: Pub) : LocationDifficulty{
    const questStore = useQuestStore()
    if( pub.id === questStore.startPub?.id) { return 'start'}
    if( pub.id === questStore.endPub?.id) { return 'end'}

    if( questStore.endPub === undefined || questStore.startPub === undefined) {
        // this should not actually happen but it keeps typescript quiet
        return 'medium'
    }
    // calculate distance to start and end location
    const distanceFromStart = calculateDistance(questStore.startPub.lat,questStore.startPub.lng,pub.lat,pub.lng)
    const distanceFromEnd = calculateDistance(questStore.endPub.lat,questStore.endPub.lng,pub.lat,pub.lng)
    const ratio = distanceFromStart / distanceFromEnd
    if(ratio<0.3) { return 'easy'}
    if(ratio>0.7) { return 'hard'}
    return 'medium'
}
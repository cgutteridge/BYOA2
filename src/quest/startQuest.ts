import {Coordinates, GameLocation, toGameLocationTypeId} from '@/types'
import {useQuestStore} from "@/stores/questStore.ts";
import {useInventoryStore} from "@/stores/inventoryStore.ts";
import {generateRandomItem} from "@/quest/generateRandomItem.ts";
import {useLocationStore} from "@/stores/locationStore.ts";
import initialiseGameLocation from "@/quest/initialiseLocation.ts";
import {scoutLocation} from "@/quest/scoutLocation.ts";
import {ChatGPTAPI} from "@/api/chatGPT.ts";
import {useLogStore} from "@/stores/logStore.ts";
import {useRouteStore} from "@/stores/routeStore.ts";
import {fetchSecondaryGameLocations} from "@/api/overpass.ts";
import calculateDistance from "@/utils/calculateDistance.ts";
import pickWeightedOne from "@/utils/pickWeightedOne.ts";

export async function startQuest(
    title: string,
    startGameLocation: GameLocation,
    endGameLocation: GameLocation,
    difficulty: number,
    players: number,
    minimumLocations: number = 3,
): Promise<void> {
    const questStore = useQuestStore()
    const locationStore = useLocationStore()
    const inventoryStore = useInventoryStore()
    const logStore = useLogStore()
    const routeStore = useRouteStore()

    const chatGPT = new ChatGPTAPI()

    questStore.setStatus('init');

    // Initialize quest details using ChatGPT
    try {
        const questData = await chatGPT.initializeQuest(
            startGameLocation.name,
            endGameLocation.name,
            minimumLocations,
            title
        )

        questStore.setTitle(title);
        questStore.setDescription(questData.questDescription);
        questStore.setTokenTitle(questData.tokenTitle);
        questStore.setTokenDescription(questData.tokenDescription);
    } catch (error) {
        console.error('Failed to initialize quest with ChatGPT:', error);
        // Fallback to basic initialization
        questStore.setTitle(title);
        questStore.setDescription(`Your quest is to reach ${endGameLocation.name}`);
        questStore.setTokenTitle('shard of truth');
        questStore.setTokenDescription('a magical shard that contains a piece of ancient knowledge');
    }

    questStore.setStartGameLocationId(startGameLocation.id);
    questStore.setEndGameLocationId(endGameLocation.id);
    questStore.setPlayerCount(players);
    questStore.setDifficulty(difficulty);
    questStore.setMinimumLocations(minimumLocations);
    questStore.setXP(0); // Initialize player XP to zero when starting a new quest
    questStore.setBooze(0); // Initialize booze consumed to zero when starting a new quest
    questStore.setSoft(0); // Initialize soft drinks consumed to zero when starting a new quest
    questStore.setScoutRange(200)

    // Initialize locations
    locationStore.locations.forEach((location:GameLocation) => {
        initialiseGameLocation(location)
    })

    const midPoint : Coordinates = {
        lat: (startGameLocation.coordinates.lat, endGameLocation.coordinates.lat) / 2,
        lng: (startGameLocation.coordinates.lng, endGameLocation.coordinates.lng) / 2
    }

    // later around start location and end location
    const extraLocations = [
        ...await fetchSecondaryGameLocations(startGameLocation.coordinates, 1000),
        ...await fetchSecondaryGameLocations(midPoint, 1000),
        ...await fetchSecondaryGameLocations(endGameLocation.coordinates, 1000)
    ]

    // add extras one by one unless they are too near another location
    extraLocations.forEach((extraLocation) => {
        // only add it if it's more than 100m away from all current locations
        if( locationStore.locations.every(
            (currentLocation:GameLocation)=>calculateDistance(extraLocation.coordinates, currentLocation.coordinates)>100)
        ) {
            extraLocation.type = toGameLocationTypeId(pickWeightedOne(
                [
                    {weight: 5, value: 'stash'},
                    {weight: 1, value: 'shop'}
                    ]))
            locationStore.locations.push( extraLocation )
        }
    })

    // Clear any existing inventory items
    while (inventoryStore.items.length > 0) {
        inventoryStore.removeItem(inventoryStore.items[0].id);
    }
    
    // Add one level 1 item per player
    for (let i = 0; i < players; i++) {
        const item = generateRandomItem(2);
        inventoryStore.addItem(item);
    }

    await scoutLocation(questStore.startGameLocation as GameLocation);
    questStore.setCurrentGameLocation(startGameLocation.id)
    startGameLocation.hasBeenVisited = true
    startGameLocation.viewed = true

    await scoutLocation(questStore.endGameLocation as GameLocation);

    routeStore.clearRoute()

    logStore.clearLog()

    questStore.setStatus('active');
}
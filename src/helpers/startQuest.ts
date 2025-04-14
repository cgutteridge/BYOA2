import type {Pub} from '@/types'
import {useQuestStore} from "@/stores/questStore.ts";
import {usePubStore} from "@/stores/pubStore.ts";
import initialisePub from "@/helpers/initialisePub.ts";
import { useInventoryStore } from "@/stores/inventoryStore.ts";
import { generateRandomItem } from "@/helpers/generateRandomItem.ts";

export async function startQuest(
    title: string,
    startPub: Pub,
    endPub: Pub,
    difficulty: number,
    players: number,
): Promise<void> {
    const questStore = useQuestStore()
    const pubStore = usePubStore()
    const inventoryStore = useInventoryStore()

    questStore.setTitle(title);
    questStore.setDescription(`Your quest is to reach ${endPub.name}`);
    questStore.setStartPubId(startPub.id);
    questStore.setEndPubId(endPub.id);
    questStore.setPlayerCount(players);
    questStore.setStatus('active');
    questStore.setDifficulty(difficulty);
    questStore.setXP(0); // Initialize player XP to zero when starting a new quest

    // Initialize pubs
    pubStore.pubs.forEach((pub) => {
        initialisePub(pub)
    })
    
    // Clear any existing inventory items
    while (inventoryStore.items.length > 0) {
        inventoryStore.removeItem(inventoryStore.items[0].id);
    }
    
    // Add one level 1 item per player
    for (let i = 0; i < players; i++) {
        const item = generateRandomItem(1);
        inventoryStore.addItem(item);
    }
}
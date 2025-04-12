import type {Pub} from '@/types'
import {useQuestStore} from "@/stores/questStore.ts";
import {usePubStore} from "@/stores/pubStore.ts";
import initialisePub from "@/helpers/initialisePub.ts";

export async function startQuest(
    title: string,
    startPub: Pub,
    endPub: Pub,
    difficulty: number,
    players: number,
): Promise<void> {
    const questStore = useQuestStore()
    const pubStore = usePubStore()

    questStore.setTitle(title);
    questStore.setDescription(`Your quest is to reach ${endPub.name}`);
    questStore.setStartPubId(startPub.id);
    questStore.setEndPubId(endPub.id);
    questStore.setPlayerCount(players);
    questStore.setStatus('active');
    questStore.setDifficulty(difficulty);

    pubStore.pubs.forEach((pub) => {
        initialisePub(pub)
    })
}
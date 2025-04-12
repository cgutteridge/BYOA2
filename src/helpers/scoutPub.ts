import type {Pub, Unit} from '../types'
import {ChatGPTAPI} from '../api/chatGPT'
import generateMonsters from './generateMonsters.ts'
import {locationTypesById} from "@/data/locationTypes.ts";
import {monsterTypes} from "@/data/monsterTypes.ts";
import { useQuestStore } from '@/stores/questStore.ts';
/**
 * Scout a location, generating its description, monsters, and prize
 * @param pub The pub to scout
 * @returns Promise resolving to true when scouting is complete
 */
export async function scoutPub(
    pub: Pub,
): Promise<boolean> {
    const chatGPT = new ChatGPTAPI()
    const questStore = useQuestStore()

    // Mark the pub as scouted
    pub.scouted = true

    // Generate monsters for this location
    const monsters = generateMonsters(pub)

    // Assign the monsters to the pub
    pub.monsters = monsters

    // Create a string description of the monsters for the API
    const monstersDescription = formatMonstersDescription(monsters)

    const locationType = locationTypesById[pub.locationType]

    let extraInstructions = ''
    if(pub.difficulty === 'start') {
        extraInstructions = `this is the first pub in the quest, where the quest begins.
         Please describe how this location triggers the whole quest. The quest is "${questStore.title}: ${questStore.description}"`
    }
    if(pub.difficulty === 'end') {
        extraInstructions = `this is the last pub in the quest, where the quest ends. The quest was "${questStore.title}: ${questStore.description}"`
    }
   
    console.log(pub,extraInstructions)
    // Generate pub description, name, and prize from AI
    const {
        name,
        description,
        prizeName,
        prizeDescription
    } = await chatGPT.generatePubDescription(
        pub.name,
        locationType.title,
        monstersDescription,
        "an item that lets you defeat any single enemy. Single use..",
        extraInstructions
    )

    // Update the pub with the new information
    pub.name = name
    pub.prizeName = prizeName
    pub.prizeDescription = prizeDescription
    pub.description = description

    return true
}

/**
 * Format the monsters as a string description
 * @param monsters Array of monsters
 * @returns A string description including monster count, type and drink
 */
export function formatMonstersDescription(monsters: Unit[]): string {
    if (!monsters.length) return "no monsters"

    return monsters.map(monster => {
        const monsterType = monsterTypes.find(m => m.id === monster.type);
        const title = monsterType?.title || monster.type;
        return `${monster.count} ${title}`;
    }).join(', ');
}
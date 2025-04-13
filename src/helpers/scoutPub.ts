import type {Pub, Unit} from '../types'
import {ChatGPTAPI} from '../api/chatGPT'
import generateMonsters from './generateMonsters.ts'
import {locationTypesById} from "@/data/locationTypes.ts";
import {monsterTypes} from "@/data/monsterTypes.ts";
import { useQuestStore } from '@/stores/questStore.ts';
import { generateGiftItem, generatePrizeItem, generateUnitItem } from './generateItems.ts';

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

    // Generate items for each unit based on their level
    monsters.forEach(unit => {
        unit.item = generateUnitItem(unit);
    });

    // Assign the monsters to the pub
    pub.monsters = monsters

    // Generate a gift item based on location difficulty
    if (pub.difficulty) {
        pub.giftItem = generateGiftItem(pub.difficulty);
        
        // Also generate a prize item to be awarded for completing the location
        const prizeItem = generatePrizeItem(pub.difficulty);
        // We'll store this as metadata, but not display it until the player defeats all monsters
        pub.prizeItem = prizeItem;
    }

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
    
    // Get prize and gift item powers to pass to ChatGPT
    const prizeItemPower = pub.prizeItem?.power || "an item that lets you defeat any single enemy";
    const giftItemPower = pub.giftItem?.power;
    
    // Generate pub description, name, and item details from AI
    const {
        name,
        description,
        prizeItemName,
        prizeItemDescription,
        giftItemName,
        giftItemDescription
    } = await chatGPT.generatePubDescription(
        pub.name,
        locationType.title,
        monstersDescription,
        prizeItemPower,
        extraInstructions,
        giftItemPower
    )

    // Update the pub with the new information
    pub.name = name;
    pub.description = description;
    
    // Update prize item with AI-generated name and description
    if (pub.prizeItem) {
        pub.prizeItem.name = prizeItemName;
        pub.prizeItem.description = prizeItemDescription;
    }
    
    // Update gift item with AI-generated name and description (if available)
    if (pub.giftItem && giftItemName && giftItemDescription) {
        pub.giftItem.name = giftItemName;
        pub.giftItem.description = giftItemDescription;
    }

    // Now generate names for each unit and their members
    if (pub.monsters && pub.monsters.length > 0) {
        // Prepare the units data for the AI call
        const unitsData = pub.monsters.map(unit => {
            const monsterType = monsterTypes.find(m => m.id === unit.type);
            return {
                type: unit.type,
                title: monsterType?.title || unit.type,
                memberCount: unit.members.length,
                level: monsterType?.level || 'unknown',
                species: monsterType?.species || 'unknown'
            };
        });

        // Call the AI to generate names
        const unitNamesData = await chatGPT.generateUnitNames(
            pub.name,
            pub.description,
            unitsData
        );

        // Update the unit and member names with the AI-generated names
        pub.monsters.forEach((unit, unitIndex) => {
            if (unitNamesData[unitIndex]) {
                // Update the unit name
                unit.name = unitNamesData[unitIndex].unitName;
                
                // Update the member names
                unit.members.forEach((member, memberIndex) => {
                    if (unitNamesData[unitIndex].memberNames[memberIndex]) {
                        member.name = unitNamesData[unitIndex].memberNames[memberIndex];
                    }
                });
            }
        });
    }

    return true;
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
        return `${monster.members.length} ${title}`;
    }).join(', ');
}
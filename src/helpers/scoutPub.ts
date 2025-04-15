import type {Monster, Pub} from '../types'
import {ChatGPTAPI} from '../api/chatGPT'
import generateMonsters from './generateMonsters.ts'
import {locationTypesById} from "@/data/locationTypes.ts";
import {monsterTypes} from "@/data/monsterTypes.ts";
import { useQuestStore } from '@/stores/questStore.ts';
import { generateGiftItem, generatePrizeItem, generateUnitItem } from './generateItems.ts';
import { generateEffectDescription } from './generateEffectDescription'

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

    // Generate items for elite and boss monsters
    monsters.forEach(monster => {
        if (monster.item !== undefined) {
            const monsterType = monsterTypes.find(m => m.id === monster.type);
            if (monsterType && (monsterType.level === 'elite' || monsterType.level === 'boss')) {
                monster.item = generateUnitItem({ type: monster.type } as any);
            } else {
                monster.item = undefined;
            }
        }
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
    const prizeItemPower = pub.prizeItem ? generateEffectDescription(pub.prizeItem) : "nothing";
    const giftItemPower = pub.giftItem ? generateEffectDescription(pub.giftItem) : undefined;
    
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

    // Now generate names for each monster
    if (pub.monsters && pub.monsters.length > 0) {
        // Group monsters by type for the API call
        const monstersByType = new Map<string, Monster[]>();
        
        pub.monsters.forEach(monster => {
            if (!monstersByType.has(monster.type)) {
                monstersByType.set(monster.type, []);
            }
            monstersByType.get(monster.type)!.push(monster);
        });
        
        // Prepare the monster data for the AI call
        const monsterGroups = Array.from(monstersByType.entries()).map(([type, monsters]) => {
            const monsterType = monsterTypes.find(m => m.id === type);
            return {
                type: type,
                title: monsterType?.title || type,
                count: monsters.length,
                level: monsterType?.level || 'unknown',
                species: monsterType?.species || 'unknown'
            };
        });

        // Call the AI to generate names
        const namesData = await chatGPT.generateMonsterNames(
            pub.name,
            pub.description,
            monsterGroups
        );
        
        // Update monster names with AI-generated names
        const typeKeys = Array.from(monstersByType.keys());
        namesData.forEach((names, groupIndex) => {
            const type = typeKeys[groupIndex];
            const monsters = monstersByType.get(type) || [];
            
            monsters.forEach((monster, index) => {
                if (names && names[index]) {
                    monster.name = names[index];
                }
            });
        });
    }

    return true;
}

/**
 * Format the monsters as a string description
 * @param monsters Array of monsters
 * @returns A string description including monster count, type and drink
 */
export function formatMonstersDescription(monsters: Monster[]): string {
    if (!monsters.length) return "no monsters";

    // Group monsters by type
    const monsterCounts = new Map<string, number>();
    
    monsters.forEach(monster => {
        const count = monsterCounts.get(monster.type) || 0;
        monsterCounts.set(monster.type, count + 1);
    });
    
    return Array.from(monsterCounts.entries()).map(([type, count]) => {
        const monsterType = monsterTypes.find(m => m.id === type);
        const title = monsterType?.title || type;
        return `${count} ${title}`;
    }).join(', ');
}
import type {Monster, GameLocation} from '../types'
import {ChatGPTAPI} from '../api/chatGPT.ts'
import generateMonsters from './generateMonsters.ts'
import {monsterTypes} from "@/data/monsterTypes.ts";
import {useQuestStore} from '@/stores/questStore.ts';
import {generateEffectDescription} from './generateEffectDescription.ts'
import {monsterItem} from "@/quest/monsterItem.ts";
import {locationPrizeItem} from "@/quest/locationPrizeItem.ts";
import {locationGiftItem} from "@/quest/locationGiftItem.ts";
import {locationTypesById} from "@/data/locationTypes.ts";

/**
 * Scout a gameLocation, generating its description, monsters, and prize
 * @param gameLocation The gameLocation to scout
 * @returns Promise resolving to true when scouting is complete
 */
export async function scoutLocation(
    gameLocation: GameLocation,
): Promise<boolean> {
    const chatGPT = new ChatGPTAPI()
    const questStore = useQuestStore()

    // Mark the gameLocation as scouted
    gameLocation.scouted = true

    // Generate monsters for this gameLocation
    const monsters = generateMonsters(gameLocation)

    // Generate items for elite and boss monsters
    monsters.forEach(monster => {
        if (monster.item !== undefined) {
            const monsterType = monsterTypes.find(m => m.id === monster.type);
            if (monsterType && (monsterType.level === 'elite' || monsterType.level === 'boss')) {
                monster.item = monsterItem(monster.type);
            } else {
                monster.item = undefined;
            }
        }
    });

    // Assign the monsters to the gameLocation
    gameLocation.monsters = monsters

    // Generate a gift item based on gameLocation difficulty
    if (gameLocation.difficulty) {
        gameLocation.giftItem = locationGiftItem(gameLocation.difficulty);

        // Also generate a prize item to be awarded for completing the gameLocation
        // We'll store this as metadata, but not display it until the player defeats all monsters
        gameLocation.prizeItem = locationPrizeItem(gameLocation.difficulty);
    }

    // Create a string description of the monsters for the API
    const monstersDescription = formatMonstersDescription(monsters)

    const gameLocationType = locationTypesById[gameLocation.gameLocationType]

    let extraInstructions = ''
    if(gameLocation.difficulty === 'start') {
        extraInstructions = `this is the first gameLocation in the quest, where the quest begins.
         Please describe how this gameLocation triggers the whole quest. The quest is "${questStore.title}: ${questStore.description}"`
    }
    if(gameLocation.difficulty === 'end') {
        extraInstructions = `this is the last gameLocation in the quest, where the quest ends. The quest was "${questStore.title}: ${questStore.description}"`
    }
   
    console.log(gameLocation,extraInstructions)
    
    // Get prize and gift item powers to pass to ChatGPT
    const prizeItemPower = gameLocation.prizeItem ? generateEffectDescription(gameLocation.prizeItem) : "nothing";
    const giftItemPower = gameLocation.giftItem ? generateEffectDescription(gameLocation.giftItem) : undefined;
    
    // Generate gameLocation description, name, and item details from AI
    const {
        name,
        description,
        prizeItemName,
        prizeItemDescription,
        giftItemName,
        giftItemDescription
    } = await chatGPT.generateGameLocationDescription(
        gameLocation.name,
        gameLocationType.title,
        monstersDescription,
        prizeItemPower,
        extraInstructions,
        giftItemPower
    )

    // Update the gameLocation with the new information
    gameLocation.name = name;
    gameLocation.description = description;
    
    // Update prize item with AI-generated name and description
    if (gameLocation.prizeItem) {
        gameLocation.prizeItem.name = prizeItemName;
        gameLocation.prizeItem.description = prizeItemDescription;
    }
    
    // Update gift item with AI-generated name and description (if available)
    if (gameLocation.giftItem && giftItemName && giftItemDescription) {
        gameLocation.giftItem.name = giftItemName;
        gameLocation.giftItem.description = giftItemDescription;
    }

    // Now generate names for each monster
    if (gameLocation.monsters && gameLocation.monsters.length > 0) {
        // Group monsters by type for the API call
        const monstersByType = new Map<string, Monster[]>();
        
        gameLocation.monsters.forEach(monster => {
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
            gameLocation.name,
            gameLocation.description,
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
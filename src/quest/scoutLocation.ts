import type {GameLocation, Monster} from '../types'
import {ChatGPTAPI} from '../api/chatGPT.ts'
import generateMonsters from './generateMonsters.ts'
import {monsterTypes} from "@/data/monsterTypes.ts";
import {useQuestStore} from '@/stores/questStore.ts';
import {monsterItem} from "@/quest/monsterItem.ts";
import {locationPrizeItem} from "@/quest/locationPrizeItem.ts";
import {locationGiftItem} from "@/quest/locationGiftItem.ts";
import {locationTypesById} from "@/data/locationTypes.ts";
import {generateVictoryItem} from "@/quest/itemUtils.ts";
import {powerFactory} from "@/powers";
import {generateRandomItem} from "@/quest/generateRandomItem.ts";
import pickOne from "@/utils/pickOne.ts";

/**
 * Scout a location, generating its description, monsters, and prize
 * @param location The location to scout
 * @returns Promise resolving to true when scouting is complete
 */
export async function scoutLocation(
    location: GameLocation,
): Promise<void> {
    const chatGPT = new ChatGPTAPI()
    const questStore = useQuestStore()

    // Mark the location as scouted
    location.scouted = true
    
    // Initialize defeatedEnemies counter if not already set
    location.defeatedEnemies = 0

    // Initialize hasBeenVisited flag to false
    location.hasBeenVisited = false

    // Stash locations just have a gift item
    if (location.type === 'stash') {
        const points = pickOne([1,2,3,4])+pickOne([1,2,3,4])
        location.giftItem = generateRandomItem(points);

        const giftItemPower = powerFactory.getPower(location.giftItem.power)
        let giftItemEffect = "??"
        if (giftItemPower) {
            giftItemEffect = giftItemPower.generateEffectDescription(location.giftItem)
        }
        // Generate location description, name, and item details from AI
        const {
            locationName,
            locationDescription,
            itemName,
            itemDescription
        } = await chatGPT.generateGameLocationStashDescription(
            location.name,
            giftItemEffect
        )
        location.name = locationName
        location.description = locationDescription
        location.giftItem.name = itemName
        location.giftItem.description = itemDescription
        return
    }

    // Generate monsters for this location
    const monsters = generateMonsters(location)

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

    // Assign the monsters to the location
    location.monsters = monsters

    // Generate a gift item based on location difficulty
    if (location.difficulty) {
        location.giftItem = locationGiftItem(location.difficulty);

        // For the final location, use the victory item as the prize
        if (location.difficulty === 'end') {
            location.prizeItem = generateVictoryItem(location);
        } else {
            // For other locations, generate a regular prize item
            location.prizeItem = locationPrizeItem(location.difficulty);
        }
    }

    // Create a string description of the monsters for the API
    const monstersDescription = formatMonstersDescription(monsters)

    const locationType = locationTypesById[location.type]

    let extraInstructions = ''
    if(location.difficulty === 'start') {
        extraInstructions = `this is the first location in the quest, where the quest begins.
         Please describe how this location triggers the whole quest. The quest is "${questStore.title}: ${questStore.description}"`
    }
    if(location.difficulty === 'end') {
        extraInstructions = `this is the last location in the quest, where the quest ends. The quest was "${questStore.title}: ${questStore.description}"`
    }
   
    // console.log(location,extraInstructions)

    let giftItemEffect = ''
    if (location.giftItem) {
        const giftItemPower = powerFactory.getPower(location.giftItem.power)
        if (giftItemPower) {
            giftItemEffect = giftItemPower.generateEffectDescription(location.giftItem)
        }
    }

    let prizeItemEffect = ''
    if (location.prizeItem) {
        const prizeItemPower = powerFactory.getPower(location.prizeItem.power)
        if (prizeItemPower) {
            prizeItemEffect = prizeItemPower.generateEffectDescription(location.prizeItem)
        }
    }

    // Generate location description, name, and item details from AI
    const {
        name,
        description,
        prizeItemName,
        prizeItemDescription,
        giftItemName,
        giftItemDescription
    } = await chatGPT.generateGameLocationDescription(
        location.name,
        locationType.title,
        monstersDescription,
        prizeItemEffect,
        extraInstructions,
        giftItemEffect
    )

    // Update the location with the new information
    location.name = name;
    location.description = description;
    
    // Update prize item with AI-generated name and description
    if (location.prizeItem) {
        // For victory items, keep the original name which is the quest title
        if (location.difficulty === 'end') {
            location.prizeItem.description = prizeItemDescription;
        } else {
            location.prizeItem.name = prizeItemName;
            location.prizeItem.description = prizeItemDescription;
        }
    }
    
    // Update gift item with AI-generated name and description (if available)
    if (location.giftItem && giftItemName && giftItemDescription) {
        location.giftItem.name = giftItemName;
        location.giftItem.description = giftItemDescription;
    }

    // Now generate names for each monster
    if (location.monsters && location.monsters.length > 0) {
        // Group monsters by type for the API call
        const monstersByType = new Map<string, Monster[]>();
        
        location.monsters.forEach(monster => {
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
            location.name,
            location.description,
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
import type {GameLocation, Item, Monster} from '../types'
import {ChatGPTAPI} from '../api/chatGPT.ts'
import generateMonsters from './generateMonsters.ts'
import {monsterTypeById} from '@/data/monsterTypesLoader'
import {monsterItem} from "@/quest/monsterItem.ts";
import {locationPrizeItem} from "@/quest/locationPrizeItem.ts";
import {locationGiftItem} from "@/quest/locationGiftItem.ts";
import {locationTypesById} from "@/data/locationTypes.ts";
import {generateVictoryItem} from "@/quest/itemUtils.ts";
import {powerFactory} from "@/powers";
import {generateRandomItem} from "@/quest/generateRandomItem.ts";
import pickOne from "@/utils/pickOne.ts";
import {toMonsterTypeId} from '@/types';
import {useQuestStore} from "@/stores/questStore.ts";

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
        const points = pickOne([1, 2, 3, 4]) + pickOne([1, 2, 3, 4])
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

    // Shop locations have wares to choose from as do some game locations too
    if (['shop', 'market', 'magic_shop'].includes(location.type)) {
        const spread = pickOne([[12, 2], [8, 3], [6, 4], [3, 8]])
        const wares = []
        for (let i = 0; i < spread[0]; i++) {
            wares.push(generateRandomItem(spread[1]))
        }
        location.wares = wares
    }

    if (location.type === 'shop') {
        // Generate shop description, name, and item details from AI
        const {
            locationName,
            locationDescription
        } = await chatGPT.generateGameLocationShopDescription(
            location.name
        )
        location.name = locationName
        location.description = locationDescription
        return
    }

    // Generate monsters for this location
    const monsters = generateMonsters(location)

    // Generate items for elite and boss monsters
    monsters.forEach(monster => {
        if (monster.item !== undefined) {
            const monsterType = monsterTypeById(monster.type);
            if (monsterType.level === 'elite' || monsterType.level === 'boss') {
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
    if (location.difficulty === 'start') {
        extraInstructions = `this is the first location in the quest, where the quest begins.
         Please describe how this location triggers the whole quest. The quest is "${questStore.title}: ${questStore.description}"`
    }

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
    if (location.difficulty === 'end') {
        // Generate end location description, name, and item details from AI
        const {
            locationName,
            locationDescription,
            questItemDescription,
        } = await chatGPT.generateEndGameLocationDescription(
            location.name,
            locationType.title,
            monstersDescription,
            questStore.title,
            questStore.description,
            questStore.tokenTitle,
            questStore.tokenDescription,
            questStore.minimumLocations
        )
        // Update the location with the new information
        location.name = locationName;
        location.description = locationDescription;
        (location.prizeItem as Item).description = questItemDescription;
    } else {

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
            location.prizeItem.name = prizeItemName;
            location.prizeItem.description = prizeItemDescription;
        }

        // Update gift item with AI-generated name and description (if available)
        if (location.giftItem && giftItemName && giftItemDescription) {
            location.giftItem.name = giftItemName;
            location.giftItem.description = giftItemDescription;
        }
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
            const monsterType = monsterTypeById(toMonsterTypeId(type));
            return {
                type: type,
                title: monsterType.title,
                count: monsters.length,
                level: monsterType.level,
                species: monsterType.species
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
        const monsterType = monsterTypeById(toMonsterTypeId(type));
        const title = monsterType.title;
        return `${count} ${title}`;
    }).join(', ');
}
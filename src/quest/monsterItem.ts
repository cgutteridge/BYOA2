import {generateRandomItem} from "@/quest/generateRandomItem.ts";
import {monsterTypeById} from "@/data/monsterTypesLoader.ts";
import {Item, MonsterTypeId} from "@/types";

/**
 * Generate an item for a monster unit based on its level
 * @returns An item appropriate for the unit's level
 * @param monsterType
 */
export function monsterItem(monsterType: MonsterTypeId): Item | undefined {
    // Only generate an item with a 40% probability

    // Find the monster info to get its level
    const monster = monsterTypeById(monsterType);

    // Generate item based on monster level
    switch (monster.level) {
        case 'minion':
            if (Math.random() > 0.1) {
                return undefined;
            }
            return generateRandomItem(1);
        case 'grunt':
            if (Math.random() > 0.2) {
                return undefined;
            }
            return generateRandomItem(2);
        case 'elite':
            if (Math.random() > 0.5) {
                return undefined;
            }
            return generateRandomItem(3);
        case 'boss':
            // boss always drops something good
            return generateRandomItem(5);
        default:
            return undefined;
    }
}
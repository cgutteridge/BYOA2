import {generateRandomItem} from "@/quest/generateRandomItem.ts";
import {Item, GameLocationDifficulty} from "@/types";

/**
 * Generate a prize item based on gameLocation difficulty
 * @param difficulty The gameLocation difficulty
 * @returns An item appropriate for the difficulty
 */
export function locationPrizeItem(difficulty: GameLocationDifficulty): Item {
    switch (difficulty) {
        case 'easy':
        case 'start':
            // Easy gameLocations have level 2 prizes
            return generateRandomItem(2);
        case 'medium':
            // Medium gameLocations have level 3 prizes
            return generateRandomItem(3);
        case 'hard':
        case 'end':
            // Hard and end gameLocations have level 4 prizes
            return generateRandomItem(4);
        default:
            // Fallback to level 2
            return generateRandomItem(2);
    }
}

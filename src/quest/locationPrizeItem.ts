import {generateRandomItem} from "@/quest/generateRandomItem.ts";
import {Item} from "@/types/item.ts";
import {LocationDifficulty} from "@/types";

/**
 * Generate a prize item based on location difficulty
 * @param difficulty The location difficulty
 * @returns An item appropriate for the difficulty
 */
export function generatePrizeItem(difficulty: LocationDifficulty): Item {
    switch (difficulty) {
        case 'easy':
        case 'start':
            // Easy locations have level 2 prizes
            return generateRandomItem(2);
        case 'medium':
            // Medium locations have level 3 prizes
            return generateRandomItem(3);
        case 'hard':
        case 'end':
            // Hard and end locations have level 4 prizes
            return generateRandomItem(4);
        default:
            // Fallback to level 2
            return generateRandomItem(2);
    }
}

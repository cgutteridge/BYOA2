import {LocationDifficulty} from "@/types";
import {Item} from "@/types/item.ts";
import {generateRandomItem} from "@/quest/generateRandomItem.ts";

/**
 * Generate a gift item based on location difficulty
 * @param difficulty The location difficulty
 * @returns An item or undefined if no gift should be generated
 */
export function locationGiftItem(difficulty: LocationDifficulty): Item | undefined {
    // Easy locations always have a level 1 gift
    if (difficulty === 'easy' || difficulty === 'start') {
        return generateRandomItem(1);
    }

    // Medium locations have a 50% chance of a level 2 gift
    if (difficulty === 'medium') {
        return Math.random() < 0.5 ? generateRandomItem(2) : undefined;
    }

    // Hard and end locations have no gift
    return undefined;
}


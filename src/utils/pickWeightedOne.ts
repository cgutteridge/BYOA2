import {WeightedList} from "@/types";

/**
 * Helper function to select a random value based on weights
 */
export default function pickWeightedOne<T>(list: WeightedList<T>): T {

    const totalWeight = list.reduce((sum, pattern) => sum + pattern.weight, 0)
    let randomValue = Math.random() * totalWeight

    for (const item of list) {
        randomValue -= item.weight
        if (randomValue <= 0) {
            return item.value
        }
    }

    // Fallback to first pattern if something goes wrong
    return list[0].value
}
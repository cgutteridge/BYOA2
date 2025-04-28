import type {Item} from '../types'
import {ItemPower} from './abstractItemPower'
import {useQuestStore} from '@/stores/questStore'

/**
 * Treasure power implementation - gives XP on use
 */
export class TreasurePower extends ItemPower {
    // UI properties
    readonly displayName = "Treasure"
    readonly icon = "💰"
    readonly glowColor = "rgba(255, 215, 0, 0.8)"

    // Item generation constants
    readonly baseCost = 5
    readonly canHaveTargetRestriction = false
    readonly supportsTypeTargeting = false
    readonly canHaveResultRestriction = false
    readonly maxLevel = null // Can target any level

    readonly itemTargetType = 'special'

    // Item types for this power
    readonly itemArtifactNames = ["Book of Lore", "Treasure", "Gold", "Gems", "Jewels", "Coin", "Loot"]

    // don't close the inventory after gaining treasure XP
    readonly afterUse = (_item:Item)=>{ console.log(23)}

    /**
     * Use the treasure item without a target
     */
    useWithoutTarget(item: Item): boolean {
        const questStore = useQuestStore()

        // Award XP for each use of the item
        const totalXP = 100 * item.uses

        questStore.logAndNotifyQuestEvent(
            `You found treasure worth ${totalXP} XP in ${item.name}!`,
            {xp: totalXP}
        )

        this.reduceUses(item, item.uses);
        return true
    }

    generateEffectDescription(_item: Item): string {
        return 'Gives experience.'
    }
} 
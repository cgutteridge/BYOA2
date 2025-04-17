// generate the monsters for a location based on it's attributes.
import { Monster, Pub, MonsterLevel, LocationDifficulty, Item, toMonsterId, Encounter } from '../types'
import { monsterTypes } from '../data'
import { monsterItem } from './monsterItem'
import { useQuestStore } from '../stores/questStore'
import pickOne from "../utils/pickOne"
import pickWeightedOne from "../utils/pickWeightedOne"
import {encounterTable} from "../data/encounterTable"

export default function generateMonsters(pub: Pub): Monster[] {
    // If the pub already has monsters, return them
    if (pub.monsters && pub.monsters.length > 0) {
        return pub.monsters
    }

    // Otherwise, generate new monsters
    const monsters: Monster[] = []

    // step one is to pick a pattern
    const encounter: Encounter = pickWeightedOne(encounterTable[pub.difficulty ?? 'medium'])
    console.log("encounter", encounter)

    encounter.forEach((unitSpec) => {
        // pick a monster
        let possibleMonsters = monsterTypes.filter((monster) => 
            monster.level === unitSpec.level && 
            monster.species !== 'nullified'
        )
        
        // Fallback if no monsters are available after filtering
        if (possibleMonsters.length === 0) {
            possibleMonsters = monsterTypes.filter((monster) => 
                monster.level === unitSpec.level
            )
        }
        
        const monsterType = pickOne(possibleMonsters)

        // decide how many monsters of this type to create
        const monsterCount = calculateMonsterCount(unitSpec.level, pub.difficulty ?? 'medium')
        console.log("monsterCount", monsterCount)
        console.log("monster level", unitSpec.level)
        console.log("pub difficulty", pub.difficulty)

        // Create individual monsters with placeholder names that will be replaced by AI
        for (let i = 0; i < monsterCount; i++) {
            const monsterName = monsterCount > 1
                ? `${monsterType.title} ${i + 1}`
                : monsterType.title
            let item: Item | undefined = monsterItem(monsterType.id)

            monsters.push({
                id: toMonsterId(`monster_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`),
                type: monsterType.id,
                name: monsterName, // This will be replaced with AI-generated name
                alive: true,
                item: item
            })
        }
    })

    console.log(monsters)
    return monsters
}

function calculateMonsterCount(monsterLevel: MonsterLevel, pubLevel: LocationDifficulty) {
    const questStore = useQuestStore()
    const players = questStore.playerCount
    console.log({players})
    console.log(monsterLevel)

    if (monsterLevel === 'boss') {
        return 1
    }
    if (monsterLevel === 'elite') {
        if (pubLevel === 'hard') {
            return diffMod(players)
        }
        return 1;
    }
    if (monsterLevel === 'grunt') {
        return diffMod(players)
    }
    // otherwise it's a minion
    return diffMod(players * 2)
}

// modify the monster count based on difficulty
function diffMod(monsterCount: number) {
    const questStore = useQuestStore()
    return Math.max(1, Math.round(monsterCount * questStore.difficulty))
}
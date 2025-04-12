// generate the monsters for a location based on it's attributes.
import pickWeightedOne from "@/helpers/pickWeightedOne.ts";
import {monsterTypes} from "@/data/monsterTypes.ts";
import {Encounter, LocationDifficulty, MonsterLevel, Pub, Unit} from "@/types";
import pickOne from "@/helpers/pickOne.ts";
import {useQuestStore} from "@/stores/questStore.ts";
import {encounterTable} from "@/data/encounterTable.ts";


export default function generateMonsters(pub: Pub): Unit[] {
    // step one is to pick a pattern
    const encounter: Encounter = pickWeightedOne(encounterTable[pub.difficulty ?? 'medium'])
console.log("encounter", encounter)
    const monsters: Unit[] = []
    encounter.forEach((unitSpec) => {
        // pick a monster
        const possibleMonsters = monsterTypes.filter((monster) => monster.level === unitSpec.level)
        const monsterType = pickOne(possibleMonsters)

        // decide unit size
        const unitSize = calculateUnitSize(unitSpec.level, pub.difficulty ?? 'medium')
        console.log("unitSize", unitSize)
        console.log("unit leve", unitSpec.level)
        console.log("pub difficulty",pub.difficulty)
        monsters.push({count: unitSize, type: monsterType.id})
    })
    console.log(monsters)
    return monsters
}


function calculateUnitSize(monsterLevel: MonsterLevel, pubLevel: LocationDifficulty) {
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

// modify the unit size based on difficulty
function diffMod(monsterCount: number) {
    const questStore = useQuestStore()
    return Math.max(1, Math.round(monsterCount * questStore.difficulty))
}
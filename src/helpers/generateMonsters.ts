// generate the monsters for a location based on it's attributes.
import pickWeightedOne from "@/helpers/pickWeightedOne.ts";
import {monsterTypes} from "@/data/monsterTypes.ts";
import {Encounter, Enemy, LocationDifficulty, MonsterLevel, Pub, Unit} from "@/types";
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
        console.log("unit level", unitSpec.level)
        console.log("pub difficulty", pub.difficulty)
        
        // Create enemies for the unit with placeholder names that will be replaced by AI
        const enemies: Enemy[] = []
        for (let i = 0; i < unitSize; i++) {
            const enemyName = unitSize > 1 
                ? `${monsterType.title} ${i + 1}` 
                : monsterType.title
                
            enemies.push({
                name: enemyName, // This will be replaced with AI-generated name
                alive: true
            })
        }
        
        // Create the unit with placeholder name that will be replaced by AI
        monsters.push({
            type: monsterType.id,
            name: `${monsterType.title} Group`, // This will be replaced with AI-generated unit name
            members: enemies
        })
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
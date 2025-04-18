import type {
    GameLocation,
    Item,
    ItemPowerId,
    Monster,
    MonsterFlag,
    MonsterLevel,
    MonsterTypeId,
    TargetMode
} from '../types'
import {monsterTypes} from '../data/monsterTypes'
import {useQuestStore} from "@/stores/questStore.ts";

// Base abstract class for all power implementations
export abstract class ItemPower {
    // UI properties
    readonly displayName: string = 'Unknown Power';
    readonly icon: string = '?';
    readonly glowColor: string = 'rgba(255, 255, 255, 0.8)';

    // Item generation constants
    // Base cost in points when generating items
    abstract readonly baseCost: number;

    // Whether the power can have target restrictions (species/flags)
    abstract readonly canHaveTargetRestriction: boolean;

    // Whether the power supports targeting all monsters of a type
    abstract readonly supportsTypeTargeting: boolean;

    // Default target mode when generating items
    abstract readonly defaultTargetMode: TargetMode;

    // Whether the power can have result restrictions (for transmutation)
    abstract readonly canHaveResultRestriction: boolean;

    // Level restrictions - which monster levels this power works on
    abstract readonly levelRestrictions: MonsterLevel[] | null;

    // Target selection methods
    // @ts-ignore - May be unused in base class, implemented by subclasses
    targetTypes(item: Item): MonsterTypeId[] {
        return (item.targetFilters?.species || []) as MonsterTypeId[];
    }

    /**
     * Filter monsters based on item's target filters
     */
    // @ts-ignore - May be unused in base class, implemented by subclasses
    targetMonsters(item: Item, monsters: Monster[]): Monster[] {
        return monsters.filter(monster => this.canTargetMonster(item, monster));
    }

    // @ts-ignore - May be unused in base class, implemented by subclasses
    targetGameLocations(_item: Item, _gameLocations: GameLocation[]): GameLocation[] {
        return [];
    }

    // @ts-ignore - May be unused in base class, implemented by subclasses
    hasInputs(_item: Item): { target: boolean; result: boolean } {
        return {target: true, result: false};
    }

    // Execution methods
    protected reduceUses(item: Item): void {
        if (item.uses > 0) {
            item.uses--;
        }
    }

    // @ts-ignore - May be unused in base class, implemented by subclasses
    useOnGameLocation(item: Item, gameLocationId: string): PowerResult {
        return {message: "this should be subclassed!", success: false}
    }

    /**
     * Checks if a monster meets the targeting criteria for an item
     */
    canTargetMonster(item: Item, monster: Monster): boolean {
        // Check if monster is alive
        if (!monster.alive) {
            return false;
        }

        // Find the monster type definition
        const monsterType = monsterTypes.find(mt => mt.id === monster.type);
        if (!monsterType) {
            return false;
        }


        // Check target filters from the item
        if (item.targetFilters) {
            // Check level restrictions
            if (item.targetFilters.levels && item.targetFilters.levels.length > 0) {
                if (!item.targetFilters.levels.includes(monsterType.level)) {
                    return false;
                }
            }

            // Check species restrictions
            if (item.targetFilters.species && item.targetFilters.species.length > 0) {
                if (!item.targetFilters.species.includes(monsterType.species)) {
                    return false;
                }
            }

            // Check flag restrictions
            if (item.targetFilters.flags && item.targetFilters.flags.length > 0) {
                const hasValidFlag = monsterType.flags.some((flag: MonsterFlag) =>
                    item.targetFilters?.flags?.includes(flag)
                );
                if (!hasValidFlag) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Get valid targets for an item in the current array of potential targets
     */
    getValidTargets(
        item: Item,
        targets: Monster[] | GameLocation[] | MonsterTypeId[]
    ): Monster[] | GameLocation[] | MonsterTypeId[] {
        // Determine what type of targets we're dealing with
        if (targets.length > 0) {
            if ('type' in targets[0] && 'alive' in targets[0]) {
                // It's a monster array
                return this.targetMonsters(item, targets as Monster[]);
            } else if ('monsters' in targets[0]) {
                // It's a gameLocations array
                return this.targetGameLocations(item, targets as GameLocation[]);
            }
        }

        // Default to empty array if we couldn't determine target type
        return [];
    }

    /**
     * Get all valid monster types that can be targeted
     */
    getValidMonsterTypes(item: Item, monsters: Monster[]): MonsterTypeId[] {
        if (!monsters || !monsters.length) {
            return [];
        }

        // Get all valid monsters first
        const validMonsters = this.targetMonsters(item, monsters);

        // Extract unique monster types
        const validTypes = new Set<MonsterTypeId>();

        validMonsters.forEach(monster => {
            validTypes.add(monster.type as MonsterTypeId);
        });

        return Array.from(validTypes);
    }

    useOnMonster(item: Item, monster: Monster): PowerResult {
        console.log(`Using ${item.name} to ${this.displayName} monster ${monster.id}`);

        // Reduce uses
        this.reduceUses(item);

        // Kill the monster using shared helper
        const success = this.applyEffect(item, monster);

        return {
            success,
            message: success ? `${item.name} ${this.displayName}ed the monster!` : `${item.name} failed to ${this.displayName} the monster.`
        };
    }

    useOnType(item: Item, type: MonsterTypeId): PowerResult {
        console.log(`Using ${item.name} to ${this.displayName} all monsters of type ${type}`);

        // Reduce uses
        this.reduceUses(item);

        const count = this.applyEffectToType(item, type);

        // Return success if at least one monster was killed
        return {
            success: count > 0,
            message: count > 0
                ? `${item.name} ${this.displayName}ed ${count} ${type}${count > 1 ? 's' : ''}!`
                : `${item.name} failed to ${this.displayName} any ${type}s.`
        };
    }

    // @ts-ignore
    applyEffectToType(item: Item, type: string): number {

        // Get the quest store
        const questStore = useQuestStore();

        // Get the current gameLocation's monsters
        const gameLocation = questStore.currentGameLocation;
        if (!gameLocation || !gameLocation.monsters) {
            return 0
        }

        // Find all monsters of the specified type
        const monstersOfType = gameLocation.monsters.filter(
            (monster: Monster) => monster.type === type && monster.alive
        );

        // Kill each monster
        let count = 0;
        monstersOfType.forEach((monster:Monster) => {
            if (this.applyEffect(item, monster)) {
                count++;
            }
        })

        return count
    }

    abstract applyEffect(item: Item, monster: Monster): boolean;
}

// Power factory to provide UI properties and functionality
export interface PowerFactory {
    getPower: (powerName: ItemPowerId) => ItemPower | undefined;
}

// Result type for power executions
export interface PowerResult {
    success: boolean;
    message: string;
    targets?: Monster[] | GameLocation[] | MonsterTypeId[];
    affectedItems?: Item[];
} 
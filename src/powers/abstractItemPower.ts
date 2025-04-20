import type {
    GameLocation,
    Item,
    ItemPowerId,
    Monster,
    MonsterFlag,
    MonsterLevel,
    MonsterTypeId
} from '../types'
import {monsterTypes} from '../data/monsterTypes'
import {useQuestStore} from "@/stores/questStore.ts";
import {useAppStore} from "@/stores/appStore.ts";
import {useInventoryStore} from "@/stores/inventoryStore.ts";


// Base abstract class for all power implementations
export abstract class ItemPower {
    // UI properties
    readonly displayName: string = 'Unknown Power';
    readonly icon: string = '?';
    readonly glowColor: string = 'rgba(255, 255, 255, 0.8)';

    // Item generation constants
    // Base cost in points when generating items
    abstract readonly baseCost: number;

    // USED IN ITEM GENERATION

    // Whether the power can have target restrictions (species/flags)
    abstract readonly canHaveTargetRestriction: boolean;

    // Whether the power supports targeting all monsters of a type
    abstract readonly supportsTypeTargeting: boolean;

    // Whether the power can have result restrictions (for transmutation)
    abstract readonly canHaveResultRestriction: boolean;

    // Maximum monster level this power works on (or null for any level)
    abstract readonly maxLevel: MonsterLevel | null;
    
    // Item types that can have this power
    abstract readonly itemTypes: string[];

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
    targetGameLocations(_item: Item, _locations: GameLocation[]): GameLocation[] {
        return [];
    }

    // @ts-ignore - May be unused in base class, implemented by subclasses
    hasInputs(_item: Item): { target: boolean; result: boolean } {
        return {target: true, result: false};
    }

    // Execution methods
    protected reduceUses(item: Item, n: number = 1): void {
        const inventoryStore = useInventoryStore();
        const appStore = useAppStore()
        item.uses = Math.max(0, item.uses - n)
        console.log({uses: item.uses})
        if (item.uses === 0) {
            console.log("DUST")
            inventoryStore.removeItem(item.id)
            appStore.addNotification(`${item.name} crumbles to dust.`)
        }
    }

    // @ts-ignore - May be unused in base class, implemented by subclasses
    useOnGameLocation(item: Item, locationId: string): boolean {
        return false
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

        // Check level restrictions based on maxLevel
        if (item.maxLevel) {
            const levelOrder: MonsterLevel[] = ['minion', 'grunt', 'elite', 'boss'];
            const maxLevelIndex = levelOrder.indexOf(item.maxLevel);
            const itemMonsterLevelIndex = levelOrder.indexOf(monsterType.level);
            
            if (itemMonsterLevelIndex > maxLevelIndex) {
                return false;
            }
        }

        // Check target filters from the item
        if (item.targetFilters) {
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
                // It's a locations array
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

    useOnMonster(item: Item, monster: Monster): boolean {
        const success = this.applyEffect(item, monster);

        if (success) {
            this.reduceUses(item);
        }

        return success
    }

    useOnType(item: Item, type: MonsterTypeId): boolean {
        const count = this.applyEffectToType(item, type);

        if (count > 0) {
            this.reduceUses(item);
            return true
        }
        return false
    }

    applyEffectToType(item: Item, type: MonsterTypeId): number {

        // Get the quest store
        const questStore = useQuestStore();

        // Get the current location's monsters
        const location = questStore.currentGameLocation;
        if (!location || !location.monsters) {
            return 0
        }

        // Find all monsters of the specified type
        const monstersOfType = location.monsters.filter(
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

    applyEffect(_item: Item, _monster: Monster): boolean {
        console.log("applyEffect should be subclassed.")
        return false
    }

    /**
     * Generate a description of this power's effect for the given item
     * Each power implementation should override this to provide a specific description
     */
    abstract generateEffectDescription(item: Item): string;

    /**
     * Convert item level to descriptive quality term
     */
    protected getLevelQualityTerm(level: number): string {
        switch (level) {
            case 1: return "crap";
            case 2: return "mediocre";
            case 3: return "decent";
            case 4: return "superior";
            case 5: return "excellent";
            case 6: return "legendary";
            default: return "unknown quality";
        }
    }

    /**
     * Get a description of the item's target options
     */
     getTargetDescription(item: Item): string {
        // Handle empty or undefined item objects
        if (!item || typeof item !== 'object') {
            return 'an unknown enemy';
        }
        
        let filterDescription = '';
        let selectionMethod = '';
        
        // Add target filters if present
        if (item.targetFilters) {
            const filters = [];
            
            if (item.targetFilters.flags && item.targetFilters.flags.length > 0) {
                filters.push(item.targetFilters.flags.join('/'));
            }

            if (item.maxLevel) {
                filters.push(item.maxLevel);
            }
            
            if (item.targetFilters.species && item.targetFilters.species.length > 0) {
                filters.push(item.targetFilters.species.join('/'));
            }
            
            if (filters.length > 0) {
                filterDescription += filters.join(', ');
            }
        }

        // Determine selection method based on target mode
        if (item.target === 'pick' || item.target === 'pick_type') {
            selectionMethod = 'chosen';
        } else {
            selectionMethod = 'random';
        }
        
        // Type vs single target based on target mode
        if (item.target === 'random_type' || item.target === 'pick_type') {
            return `all ${filterDescription} enemies of one ${selectionMethod} type`;
        }
        
        return `a ${selectionMethod} ${filterDescription} enemy`;
    }

    /**
     * Get a description of the item's result for transmutation
     */
    protected getResultDescription(item: Item): string {
        if (item.power !== 'transmute' || !item.result) return '';
        
        let effect = '';
        
        switch (item.result) {
            case 'random':
                effect += "a random enemy of the same level";
                break;
            case 'pick':
                effect += "a chosen enemy of the same level";
                break;
        }
        
        return effect;
    }
}

// Power factory to provide UI properties and functionality
export interface PowerFactory {
    getPower: (powerName: ItemPowerId) => ItemPower | undefined;
}

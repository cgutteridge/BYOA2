import type { Item, Species, MonsterFlag, ItemPowerId, WeightedList } from '../types';
import { toItemId } from '../types';
import pickOne from "@/utils/pickOne.ts";
import pickWeightedOne from "@/utils/pickWeightedOne.ts";
import {allPowerIds, powerFactory} from "@/powers/index.ts";

// Available species for targeting
const AVAILABLE_SPECIES: Species[] = [
  'vampire', 'ghost', 'human', 'chameleonoid', 'humanoid', 
  'demonoid', 'special', 'fey', 'elemental', 'nullified'
];

// Available flags for targeting
const AVAILABLE_FLAGS: MonsterFlag[] = [
  'spirit', 'undead', 'mortal', 'magic-user', 'group'
];

/**
 * Generate a random item of the specified level
 * @param level Item level (1-6)
 * @returns A random item with appropriate properties for the level
 */
export function generateRandomItem(level: number): Item {
  // Use level directly as points
  const totalPoints = level;

  // console.log( `\nGENERATION: ${totalPoints} `)
  
  // Track points spent
  let remainingPoints = totalPoints;
  
  // Step 1: Pick a random power type that fits within our budget

  // Filter available powers based on cost and create weighted list
  const affordablePowersData = allPowerIds
    .map(powerId => ({ id: powerId, power: powerFactory.getPower(powerId) }))
    .filter(({ power }) => power && power.baseCost <= remainingPoints);
    
  if (affordablePowersData.length === 0) {
    // Fallback to most basic power if no powers fit
    affordablePowersData.push({ id: 'kill', power: powerFactory.getPower('kill') });
  }
  
  // Convert to weighted list format for pickWeightedOne
  const weightedPowers: WeightedList<ItemPowerId> = affordablePowersData.map(({ id, power }) => ({
    value: id,
    weight: power?.generateWeight || 12 // Default to 12 if not specified
  }));
  
  const selectedPower = pickWeightedOne(weightedPowers);
  const power = powerFactory.getPower(selectedPower);
  if (!power) {
    throw new Error(`Power ${selectedPower} not found`);
  }
  
  remainingPoints -= power.baseCost;
  
  // Always use 'random' as the default target mode
  const defaultTargetMode = 'random';
  
  // Initialize item with default properties
  const item: Item = {
    id: toItemId(`random_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
    name: generateItemName(selectedPower, defaultTargetMode),
    uses: 1,
    power: selectedPower,
    level: level,
    target: defaultTargetMode,
    targetFilters: {},
    maxLevel: power.minLevel,
  };
  
  // Step 2: Apply target restrictions if applicable
  if (power.canHaveTargetRestriction && item.targetFilters) {
    // By default, add a species restriction (50%) or flag restriction (50%)
    if (Math.random() < 0.5) {
      item.targetFilters.species = [pickOne(AVAILABLE_SPECIES)];
    } else {
      item.targetFilters.flags = [pickOne(AVAILABLE_FLAGS)];
    }
  }
  
  // Step 3: Apply result restrictions if applicable
  if (power.canHaveResultRestriction) {
    // Default to a restricted result
    item.result = 'random';
    
    // Remove resultSpecies properties as they're no longer needed
    delete item.resultSpecies;
  }

  // console.log( `power : ${item.power}`)
  // Step 4: Spend remaining points on upgrades
  while (remainingPoints > 0) {
    const availableUpgrades = getAvailableUpgrades(item, remainingPoints, selectedPower);
    // console.log( `pts ${remainingPoints}, upgrades: ${availableUpgrades.join(', ')}`);

    // Break if no more upgrades possible
    if (availableUpgrades.length === 0) break;
    
    // Pick a random upgrade
    const selectedUpgrade = pickOne(availableUpgrades);
    // console.log( `selectedUpgrade : ${selectedUpgrade}`)
    
    // Apply the upgrade and reduce remaining points
    remainingPoints = applyUpgrade(item, selectedUpgrade, remainingPoints);
  }
  
  // Update the name to match the final target mode
  item.name = generateItemName(selectedPower, item.target);
  
  return item;
}

/**
 * Get available upgrades for an item based on remaining points and power type
 */
function getAvailableUpgrades(item: Item, remainingPoints: number, powerType: ItemPowerId): string[] {
  const availableUpgrades: string[] = [];
  const power = powerFactory.getPower(powerType);
  
  if (!power) return [];
  
  // Add uses (+1 point for +2 uses)
  if (remainingPoints >= 1) {
    availableUpgrades.push('uses');
  }
  
  // Remove target restriction (+1 point)
  if (item.targetFilters?.species || item.targetFilters?.flags) {
    availableUpgrades.push('target_restriction');
  }
  
  // Remove result restriction (+1 point)
  if (item.result && item.result !== 'pick') {
    availableUpgrades.push('result_restriction');
  }


  if (item.target === 'random' && remainingPoints >= 1) {
    availableUpgrades.push('upgrade_to_pick');
  }
  if (item.target === 'random' && remainingPoints >= 1 && power.supportsTypeTargeting) {
    availableUpgrades.push('upgrade_to_random_type');
  }

  if (item.target === 'pick' && remainingPoints >= 1 && power.supportsTypeTargeting) {
    availableUpgrades.push('upgrade_to_pick_type');
  }
  if (item.target === 'random_type' && remainingPoints >= 1) {
    availableUpgrades.push('upgrade_to_pick_type');
  }

  // Increase monster level targeting
  if (item.maxLevel === 'minion' && remainingPoints >= 1 && power.maxLevel !== 'minion') {
    availableUpgrades.push('level_grunt');
  }
  if (item.maxLevel === 'grunt' && remainingPoints >= 1 && power.maxLevel !== 'grunt') {
    availableUpgrades.push('level_elite');
  }
  if (item.maxLevel === 'elite' && remainingPoints >= 1 && power.maxLevel !== 'elite') {
    availableUpgrades.push('level_boss');
  }
  
  return availableUpgrades;
}

/**
 * Apply the selected upgrade to the item and return remaining points
 */
function applyUpgrade(item: Item, upgrade: string, remainingPoints: number): number {
  switch (upgrade) {
    case 'uses':
      item.uses = (item.uses || 1) + 1;
      return remainingPoints - 1;
      
    case 'target_restriction':
      // Remove species and flag restrictions
      if (item.targetFilters) {
        delete item.targetFilters.species;
        delete item.targetFilters.flags;
      }
      return remainingPoints - 2;
      
    case 'result_restriction':
      // Upgrade to player choice
      item.result = 'pick';
      return remainingPoints - 1;
      
    case 'upgrade_to_pick':
      // Upgrade from random to pick (single target)
      item.target = 'pick';
      return remainingPoints - 1;
      
    case 'upgrade_to_random_type':
      // Upgrade from pick to random_type
      item.target = 'random_type';
      return remainingPoints - 1;
      
    case 'upgrade_to_pick_type':
      // Upgrade from random_type to pick_type
      item.target = 'pick_type';
      return remainingPoints - 1;
      
    case 'level_grunt':
      // Upgrade from minion to grunt (cost: 1)
      item.maxLevel = 'grunt';
      return remainingPoints - 1;
      
    case 'level_elite':
      // Upgrade from grunt to elite (cost: 1)
      item.maxLevel = 'elite';
      return remainingPoints - 1;
      
    case 'level_boss':
      // Upgrade from elite to boss (cost: 1)
      item.maxLevel = 'boss';
      return remainingPoints - 1;
      
    default:
      return remainingPoints;
  }
}

/**
 * Generate an item name based on power type and target mode
 */
function generateItemName(powerId: ItemPowerId, targetMode?: string): string {
  // Base material/quality descriptors
  const materials = [
    "Wooden", "Stone", "Copper", "Bronze", "Iron", "Silver", "Gold", "Crystal", 
    "Jade", "Obsidian", "Steel", "Ebony", "Glass", "Bone", "Ancient"
  ];
  
  // Get item type from the power class
  const powerInstance = powerFactory.getPower(powerId);
  
  // Get a random material and item type
  const material = pickOne(materials);
  const itemType = pickOne(powerInstance?.itemArtifactNames || ["Artifact"]);

  // Combine parts into full name
  let name = `${material} ${itemType}`;

  if( powerInstance.itemTargetType !== 'special' && powerInstance.itemTargetType !== 'none' ) {}

  // Add target mode
  if (targetMode === 'random' || targetMode === 'random_type') {
    const suffixes = ['Chaotic','Unstable','Wayward','Mercurial','Fickle','Rogue','Arnarchic']
    name = `${pickOne(suffixes)} ${name}`;
  }
  
  return name;
}






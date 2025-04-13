import { ItemType, ItemTypeId } from '../types'

export const itemTypes: ItemType[] = [
  // Level 1 Items
  {
    id: 'healing',
    title: 'Minor Healing Potion',
    power: 'Restores health to a single ally',
    level: 1
  },
  {
    id: 'transmute',
    title: 'Basic Transmuter',
    power: 'Transforms a simple object into another form',
    level: 1
  },
  {
    id: 'kill',
    title: 'Minion Bane',
    power: 'Effective against minion-level enemies',
    level: 1
  },
  
  // Level 2 Items
  {
    id: 'healing',
    title: 'Greater Healing Elixir',
    power: 'Restores health to multiple allies',
    level: 2
  },
  {
    id: 'transmute',
    title: 'Elemental Transmuter',
    power: 'Changes the elemental properties of an object or creature',
    level: 2
  },
  {
    id: 'kill',
    title: 'Elite Hunter',
    power: 'Highly effective against elite enemies',
    level: 2
  },
  
  // Level 3 Items
  {
    id: 'healing',
    title: 'Master Healer\'s Kit',
    power: 'Fully restores all allies and removes negative effects',
    level: 3
  },
  {
    id: 'transmute',
    title: 'Reality Shaper',
    power: 'Fundamentally alters the nature of the target',
    level: 3
  },
  {
    id: 'kill',
    title: 'Legendary Slayer',
    power: 'Can defeat even the most powerful boss enemies',
    level: 3
  },
  
  // Level 4 Items
  {
    id: 'healing',
    title: 'Phoenix Tears',
    power: 'Resurrects all fallen allies with full health and grants temporary invulnerability',
    level: 4
  },
  {
    id: 'transmute',
    title: 'Cosmic Forge',
    power: 'Completely reshapes reality in a limited area, allowing the creation of new objects or environments',
    level: 4
  },
  {
    id: 'kill',
    title: 'Soul Harvester',
    power: 'Can defeat multiple elite enemies at once and absorbs their essence for temporary power',
    level: 4
  },
  
  // Level 5 Items
  {
    id: 'healing',
    title: 'Divine Restoration',
    power: 'Grants immortality to the entire party for a limited duration and enhances all abilities',
    level: 5
  },
  {
    id: 'transmute',
    title: 'Planar Gateway',
    power: 'Opens portals to other dimensions, allowing access to unknown realms and resources',
    level: 5
  },
  {
    id: 'kill',
    title: 'World Ender',
    power: 'Ultimate weapon capable of defeating any enemy in existence, but comes at a great cost',
    level: 5
  }
]

// Helper function to get item types by level and type
export function getItemTypesByLevel(level: number, type?: ItemTypeId): ItemType[] {
  return itemTypes.filter(item => 
    item.level === level && (type ? item.id === type : true)
  );
}

export const itemTypesList: ItemTypeId[] = Array.from(new Set(itemTypes.map(itemType => itemType.id)))

// Note: This now only contains one entry per item type ID (the last one in the list)
export const itemTypesById: Record<ItemTypeId, ItemType> = itemTypes.reduce((acc, itemType) => {
  acc[itemType.id] = itemType
  return acc
}, {} as Record<ItemTypeId, ItemType>) 
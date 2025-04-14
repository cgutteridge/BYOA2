import { ItemType } from '../types'

export const itemTypes: ItemType[] = [
  // Level 1 Items
  {
    id: 'banish',
    title: 'Minor Banishment Scroll',
    power: 'Removes a single lesser monster',
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
    id: 'banish',
    title: 'Planar Disruptor',
    power: 'Banishes multiple minor enemies',
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
    id: 'banish',
    title: 'Void Gate Generator',
    power: 'Creates a temporary void gate that pulls all standard monsters into another dimension',
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
    id: 'banish',
    title: 'Dimensional Anchor',
    power: 'Permanently banishes any monster, including bosses, without leaving a trace',
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
    id: 'banish',
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
export function getItemTypesByLevel(level: number, type?: string): ItemType[] {
  return itemTypes.filter(item => 
    item.level === level && (type ? item.id === type : true)
  );
}

export const itemTypesList: string[] = Array.from(new Set(itemTypes.map(itemType => itemType.id)))

// Note: This now only contains one entry per item type ID (the last one in the list)
export const itemTypesById: Record<string, ItemType> = itemTypes.reduce((acc, itemType) => {
  acc[itemType.id] = itemType
  return acc
}, {} as Record<string, ItemType>) 
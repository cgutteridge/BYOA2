import type { Item } from '../types/item'

// Sample items for testing
export const sampleItems: Item[] = [
  {
    id: 'scroll_of_fireball',
    name: 'Scroll of Fireball',
    description: 'A scroll that unleashes a devastating fireball, eliminating a single enemy.',
    uses: 1,
    level: 1,
    power: 'kill',
    target: 'pick',
    targetFilters: {
      flags: ['mortal']
    }
  },
  {
    id: 'potion_of_transmutation',
    name: 'Potion of Transmutation',
    description: 'Transforms a monster into a different form of the same level when thrown at it.',
    uses: 2,
    level: 1,
    power: 'transmute',
    target: 'pick',
    result: 'random'
  },
  {
    id: 'crystal_ball_of_far_sight',
    name: 'Crystal Ball of Far Sight',
    description: 'Reveals locations up to 1000 meters away.',
    uses: 3,
    level: 2,
    power: 'scout_1000'
  },
  {
    id: 'spectral_banisher',
    name: 'Spectral Banisher',
    description: 'Banishes all spiritual entities in the area.',
    uses: 1,
    level: 3,
    power: 'kill',
    targetFilters: {
      flags: ['spirit']
    }
  },
  {
    id: 'mystic_shrinking_powder',
    name: 'Mystic Shrinking Powder',
    description: 'Reduces a powerful creature to a more manageable size and strength.',
    uses: 2,
    level: 2,
    power: 'shrink',
    target: 'pick',
    targetFilters: {
      levels: ['boss', 'elite']
    }
  },
  {
    id: 'ring_of_pickpocketing',
    name: 'Ring of Pickpocketing',
    description: 'Allows the wearer to magically steal an item from a monster without engaging in combat.',
    uses: 3,
    level: 2,
    power: 'pickpocket',
    target: 'pick'
  }
]

// Function to add sample items to the inventory
export function getRandomSampleItem(): Item {
  const randomIndex = Math.floor(Math.random() * sampleItems.length)
  return { ...sampleItems[randomIndex] }
} 
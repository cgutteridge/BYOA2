import type { EnhancedItem } from '../types/item'

// Sample items for testing
export const sampleItems: EnhancedItem[] = [
  {
    id: 'scroll_of_fireball',
    name: 'Scroll of Fireball',
    description: 'A scroll that unleashes a devastating fireball, eliminating a single enemy.',
    story: 'Crafted by the archmage Zephyrus during the War of Forgotten Flames. Each scroll contains a fragment of the eternal fire that burns in the heart of the Phoenix.',
    uses: 1,
    power: 'kill_one',
    target: 'pick',
    targetFilters: {
      flags: ['mortal']
    }
  },
  {
    id: 'potion_of_transmutation',
    name: 'Potion of Transmutation',
    description: 'Transforms a monster into a weaker form when thrown at it.',
    story: 'A chaotic mixture of unstable magical essences that can rewrite the very fabric of reality for simple beings. Developed by alchemists who specialized in magical creature containment.',
    uses: 2,
    power: 'transmute_one',
    target: 'pick',
    result: 'level',
    resultLevel: 'minion'
  },
  {
    id: 'crystal_ball_of_far_sight',
    name: 'Crystal Ball of Far Sight',
    description: 'Reveals locations up to 1000 meters away.',
    story: 'This orb was crafted from crystal mined from the furthest peaks of the Crystal Mountains. The makers imbued it with the essence of eagle spirits to grant vision beyond normal sight.',
    uses: 3,
    power: 'scout_1000'
  },
  {
    id: 'spectral_banisher',
    name: 'Spectral Banisher',
    description: 'Banishes all spiritual entities in the area.',
    story: 'Forged in sacred silver and blessed by priests of the Sun Temple, this artifact was created specifically to combat the growing threat of hostile spirits in the haunted marshlands.',
    uses: 1,
    power: 'kill_all',
    targetFilters: {
      flags: ['spirit']
    }
  },
  {
    id: 'mystic_shrinking_powder',
    name: 'Mystic Shrinking Powder',
    description: 'Reduces a powerful creature to a more manageable size and strength.',
    story: 'This fine powder glimmers with an inner light that seems to absorb the very essence of size and power. Alchemists guard its formula jealously.',
    uses: 2,
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
    story: 'Once belonging to the legendary thief Nightfingers, this enchanted ring grants its wearer temporarily enhanced dexterity and a touch of invisibility—just enough to swipe something and escape notice.',
    uses: 3,
    power: 'pickpocket',
    target: 'pick'
  }
]

// Function to add sample items to the inventory
export function getRandomSampleItem(): EnhancedItem {
  const randomIndex = Math.floor(Math.random() * sampleItems.length)
  return { ...sampleItems[randomIndex] }
} 
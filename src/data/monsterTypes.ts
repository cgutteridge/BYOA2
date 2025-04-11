import type { MonsterType } from '../types'

export const monsterTypes: MonsterType[] = [
  // Boss monsters
  {
    id: 'vampire_lord',
    title: 'Vampire Lord',
    drink: 'Bottle of Red Wine',
    level: 'boss',
    species: 'vampire',
    flags: ['undead','magic-user']
  },
  {
    id: 'elf_queen',
    title: 'Elf Queen',
    drink: 'Bottle of White Wine',
    level: 'boss',
    species: 'elf',
    flags: ['mortal']
  },
  
  // Elite monsters
  {
    id: 'vampire',
    title: 'Vampire',
    drink: 'Large Red Wine',
    level: 'elite',
    species: 'vampire',
    flags: ["undead","magic-user"]
  },
  {
    id: 'dark_knight',
    title: 'Dark Knight',
    drink: 'Pint of 6%+ Ale',
    level: 'elite',
    species: 'human',
    flags: ['mortal']
  },
  {
    id: 'highland_wraith',
    title: 'Highland Wraith',
    drink: 'Double Fancy Whisky',
    level: 'elite',
    species: 'ghost',
    flags: ['spirit']
  },
  {
    id: 'necromancer',
    title: 'Necromancer',
    drink: 'Bloody Mary',
    level: 'elite',
    species: 'human',
    flags: ['mortal','magic-user']
  },
  {
    id: 'bog_witch',
    title: 'Bog Witch',
    plural: 'Bog Witches',
    drink: 'Bailys',
    level: 'elite',
    species: 'human',
    flags: ['mortal','magic-user']
  },
  {
    id: 'mage_and_familiar',
    title: 'Mage with a Familiar',
    plural: "Mages with Familiars",
    drink: 'Whisky and a Beer',
    level: 'elite',
    species: 'human',
    flags: ['mortal','magic-user']
  },
  {
    id: 'high_elf',
    title: 'High Elf',
    drink: 'Large White Wine',
    level: 'elite',
    species: 'elf',
    flags: ['mortal']
  },

  // Grunt monsters
  {
    id: 'ork',
    title: 'Ork',
    drink: 'Pint of Cider',
    level: 'grunt',
    species: 'goblinoid',
    flags: ['mortal']
  },
  {
    id: 'human_fighter',
    title: 'Human Fighter',
    drink: 'Pint of Non-Lager',
    level: 'grunt',
    species: 'human',
    flags: ['mortal']
  },
  {
    id: 'mounted_knight',
    title: 'Mounted Knight',
    drink: 'Pint of Strong Lager',
    level: 'grunt',
    species: 'human',
    flags: ['mortal']
  },
  {
    id: 'dwarf_miner',
    title: 'Dwarf Miner',
    drink: 'Half Pint Pale Ale',
    level: 'minion',
    species: 'dwarf',
    flags: ['mortal']
  },
  {
    id: 'dwarf_warrior',
    title: 'Dwarf Warrior',
    drink: 'Ale',
    level: 'grunt',
    species: 'dwarf',
    flags: ['mortal']
  },
  {
    id: 'dryad',
    title: 'Dryad',
    drink: 'Double Gin',
    level: 'grunt',
    species: 'fey',
    flags: ['spirit']
  },
  {
    id: 'ghostly_warrior',
    title: 'Ghostly Warrior',
    drink: 'Double House Whisky',
    level: 'grunt',
    species: 'ghost',
    flags: ['spirit']
  },
  {
    id: 'ancient_spirit',
    title: 'Ancient Spirit',
    drink: 'Fancy Whisky',
    level: 'grunt',
    species: 'ghost',
    flags: ['spirit']
  },
  {
    id: 'wrathful_revenant',
    title: 'Wrathful Revenant',
    drink: 'Double Bourbon',
    level: 'grunt',
    species: 'ghost',
    flags: ['spirit']
  },
  {
    id: 'wrathful_wraith',
    title: 'Wrathful Wraith',
    drink: 'Bourbon',
    level: 'minion',
    species: 'ghost',
    flags: ['spirit']
  },
  {
    id: 'dark_knight_grunt',
    title: 'Dark Knight',
    drink: 'Guiness',
    level: 'grunt',
    species: 'human',
    flags: ['mortal']
  },
  {
    id: 'ghostly_buccaneer',
    title: 'Ghostly Buccaneer',
    drink: 'Double Light Rum',
    level: 'grunt',
    species: 'ghost',
    flags: ['spirit']
  },
  {
    id: 'demon',
    title: 'Demon',
    drink: 'Double Dark Rum',
    level: 'grunt',
    species: 'demonoid',
    flags: ['magic-user']
  },
  {
    id: 'metamorph',
    title: 'Metamorph',
    drink: 'Drink of your choice',
    level: 'grunt',
    species: 'chameleonoid',
    flags: ['mortal']
  },
  {
    id: 'zombie_horde',
    title: 'Zombie Horde',
    drink: 'Zombie cocktail',
    level: 'grunt',
    species: 'human',
    flags: ['group','undead']
  },
  {
    id: 'djinn',
    title: 'Djinn',
    plural: 'Djinn',
    drink: 'Anything in a bottle',
    level: 'grunt',
    species: 'demonoid',
    flags: ['magic-user']
  },
  {
    id: 'changeling',
    title: 'Changeling',
    drink: 'Any pint',
    level: 'grunt',
    species: 'fey',
    flags: ['group']
  },
  {
    id: 'army',
    title: 'Army',
    plural: 'Armies',
    drink: 'Any kind of pint but all the same',
    level: 'grunt',
    species: 'special',
    flags: ['group']
  },
  {
    id: 'plains_elf',
    title: 'Plains Elf',
    drink: 'Medium White Wine',
    level: 'grunt',
    species: 'elf',
    flags: ['mortal']
  },
  {
    id: 'trickster',
    title: 'Trickster',
    drink: 'Bartender\'s Choice',
    level: 'grunt',
    species: 'chameleonoid',
    flags: []
  },
  // Minion monsters
  {
    id: 'goblin',
    title: 'Goblin',
    drink: 'Half Pint Cider',
    level: 'minion',
    species: 'goblinoid',
    flags: ['mortal']
  },
  {
    id: 'thrall_vampire',
    title: 'Thrall Vampire',
    drink: 'Small Red Wine',
    level: 'minion',
    species: 'vampire',
    flags: ['undead']
  },
  {
    id: 'peasant',
    title: 'Peasant',
    drink: 'Half Pint Lager',
    level: 'minion',
    species: 'human',
    flags: ['mortal']
  },
  {
    id: 'knight',
    title: 'Knight',
    drink: 'Half Pint of Strong Lager',
    level: 'minion',
    species: 'human',
    flags: ['mortal']
  },
  {
    id: 'hedge_spirit',
    title: 'Hedge Sprite',
    drink: 'Gin',
    level: 'minion',
    species: 'fey',
    flags: ['spirit']
  },
  {
    id: 'spectral_soldier',
    title: 'Spectral Soldier',
    drink: 'House Whisky',
    level: 'minion',
    species: 'ghost',
    flags: ['spirit']
  },
  {
    id: 'desert_wisp',
    title: 'Desert Wisp',
    drink: 'Light Rum',
    level: 'minion',
    species: 'fey',
    flags: ['spirit']
  },
  {
    id: 'imp',
    title: 'Imp',
    drink: 'Dark Rum',
    level: 'minion',
    species: 'demonoid',
    flags: ['magic-user']
  },
  {
    id: 'mimic',
    title: 'Mimic',
    drink: 'Half pint of your choice',
    level: 'minion',
    species: 'chameleonoid',
    flags: []
  },
 
  {
    id: 'swarm',
    title: 'Swarm',
    drink: 'Any kind of half pint of',
    level: 'minion',
    species: 'special',
    flags: ['group']
  },
  {
    id: 'forest_elf',
    title: 'Forest Elf',
    drink: 'Small White Wine',
    level: 'minion',
    species: 'elf',
    flags: ['mortal']
  },
  {
    id: 'sugar_sprite',
    title: 'Sugar Sprite',
    drink: 'Alchopop',
    level: 'minion',
    species: 'fey',
    flags: ['magic-user']
  },
  {
    id: 'dwarf',
    title: 'Dwarf',
    drink: 'Half pint of Ale',
    level: 'minion',
    species: 'dwarf',
    flags: ['mortal']
  }
  
]

export function getRandomMonsterType(): string | null {
  const possibleMonsters = Object.entries(monsterTypes)
    .map(([id]) => id)
  
  if (possibleMonsters.length === 0) return null
  
  const randomIndex = Math.floor(Math.random() * possibleMonsters.length)
  return possibleMonsters[randomIndex]
}

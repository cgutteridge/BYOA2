import type { MonsterType } from '../types'

export const monsterTypes: MonsterType[] = [
  // Boss monsters
  {
    id: 'vampire_lord',
    title: 'Vampire Lord',
    drink: 'Bottle of Red Wine',
    level: 'boss',
    species: 'vampire',
    flags: ['undead','magic-user'],
    xp: 10.0 // ~750ml bottle, 13% ABV
  },
  {
    id: 'elf_queen',
    title: 'Elf Queen',
    drink: 'Bottle of White Wine',
    level: 'boss',
    species: 'elf',
    flags: ['mortal'],
    xp: 9.0 // ~750ml bottle, 12% ABV
  },
  
  // Elite monsters
  {
    id: 'vampire',
    title: 'Vampire',
    drink: 'Large Red Wine',
    level: 'elite',
    species: 'vampire',
    flags: ["undead","magic-user"],
    xp: 3.5, // 250ml, 14% ABV
    splits: 'thrall_vampire'
  },
  {
    id: 'dark_knight',
    title: 'Dark Knight',
    drink: 'Pint of 6%+ Ale',
    level: 'elite',
    species: 'human',
    flags: ['mortal'],
    xp: 3.4, // Pint (568ml) at 6% ABV
    splits: 'knight'
  },
  {
    id: 'highland_wraith',
    title: 'Highland Wraith',
    drink: 'Double Fancy Whisky',
    level: 'elite',
    species: 'ghost',
    flags: ['spirit'],
    xp: 2.8, // Double (50ml) at 40% ABV
    splits: 'ancient_spirit'
  },
  {
    id: 'necromancer',
    title: 'Necromancer',
    drink: 'Bloody Mary',
    level: 'elite',
    species: 'human',
    flags: ['mortal','magic-user'],
    xp: 2.0, // Mixed cocktail, ~40ml vodka at 40% ABV
    splits: 'peasant'
  },
  {
    id: 'bog_witch',
    title: 'Bog Witch',
    plural: 'Bog Witches',
    drink: 'Bailys',
    level: 'grunt',
    species: 'human',
    flags: ['mortal','magic-user'],
    xp: 1.5, // 50ml at ~17% ABV
    splits: 'peasant'
  },
  {
    id: 'mage_and_familiar',
    title: 'Mage with a Familiar',
    plural: "Mages with Familiars",
    drink: 'Whisky and a Beer',
    level: 'elite',
    species: 'human',
    flags: ['mortal','magic-user'],
    xp: 3.0, // 25ml whisky + half pint beer
    splits: 'peasant'
  },
  {
    id: 'high_elf',
    title: 'High Elf',
    drink: 'Large White Wine',
    level: 'elite',
    species: 'elf',
    flags: ['mortal'],
    xp: 3.0, // 250ml at 12% ABV
    splits: 'forest_elf'
  },

  // Grunt monsters
  {
    id: 'ork',
    title: 'Ork',
    drink: 'Pint of Cider',
    level: 'grunt',
    species: 'goblinoid',
    flags: ['mortal'],
    xp: 2.8, // Pint (568ml) at ~5% ABV
    splits: 'goblin'
  },
  {
    id: 'human_fighter',
    title: 'Human Fighter',
    drink: 'Pint of Non-Lager',
    level: 'grunt',
    species: 'human',
    flags: ['mortal'],
    xp: 2.3, // Pint (568ml) at ~4% ABV
    splits: 'peasant'
  },
  {
    id: 'mounted_knight',
    title: 'Mounted Knight',
    drink: 'Pint of Strong Lager',
    level: 'grunt',
    species: 'human',
    flags: ['mortal'],
    xp: 3.0, // Pint (568ml) at ~5.2% ABV
    splits: 'knight'
  },
  {
    id: 'dwarf_miner',
    title: 'Dwarf Miner',
    drink: 'Half Pint Pale Ale',
    level: 'minion',
    species: 'dwarf',
    flags: ['mortal'],
    xp: 1.1 // Half pint (284ml) at ~4% ABV
  },
  {
    id: 'dwarf_warrior',
    title: 'Dwarf Warrior',
    drink: 'Ale',
    level: 'grunt',
    species: 'dwarf',
    flags: ['mortal'],
    xp: 2.2, // Pint (568ml) at ~4% ABV
    splits: 'dwarf'
  },
  {
    id: 'dryad',
    title: 'Dryad',
    drink: 'Double Gin',
    level: 'grunt',
    species: 'fey',
    flags: ['spirit'],
    xp: 2.0, // Double (50ml) at 40% ABV
    splits: 'hedge_spirit'
  },
  {
    id: 'ghostly_warrior',
    title: 'Ghostly Warrior',
    drink: 'Double House Whisky',
    level: 'grunt',
    species: 'ghost',
    flags: ['spirit'],
    xp: 2.0, // Double (50ml) at 40% ABV
    splits: 'spectral_soldier'
  },
  {
    id: 'ancient_spirit',
    title: 'Ancient Spirit',
    drink: 'Fancy Whisky',
    level: 'grunt',
    species: 'ghost',
    flags: ['spirit'],
    xp: 1.0 // Standard (25ml) at 40% ABV
  },
  {
    id: 'wrathful_revenant',
    title: 'Wrathful Revenant',
    drink: 'Double Bourbon',
    level: 'grunt',
    species: 'ghost',
    flags: ['spirit'],
    xp: 2.0, // Double (50ml) at 40% ABV
    splits: 'wrathful_wraith'
  },
  {
    id: 'wrathful_wraith',
    title: 'Wrathful Wraith',
    drink: 'Bourbon',
    level: 'minion',
    species: 'ghost',
    flags: ['spirit'],
    xp: 1.0 // Standard (25ml) at 40% ABV
  },
  {
    id: 'ghostly_buccaneer',
    title: 'Ghostly Buccaneer',
    drink: 'Double Light Rum',
    level: 'grunt',
    species: 'ghost',
    flags: ['spirit'],
    xp: 2.0, // Double (50ml) at 40% ABV
    splits: 'desert_wisp'
  },
  {
    id: 'demon',
    title: 'Demon',
    drink: 'Double Dark Rum',
    level: 'grunt',
    species: 'demonoid',
    flags: ['magic-user'],
    xp: 2.0, // Double (50ml) at 40% ABV
    splits: 'imp'
  },
  {
    id: 'metamorph',
    title: 'Metamorph',
    drink: 'Drink of your choice',
    level: 'grunt',
    species: 'chameleonoid',
    flags: ['mortal'],
    xp: 2.0, // Average value
    splits: 'mimic'
  },
  {
    id: 'zombie_horde',
    title: 'Zombie Horde',
    drink: 'Zombie cocktail',
    level: 'grunt',
    species: 'human',
    flags: ['group','undead'],
    xp: 3.5, // Strong cocktail with several spirits
    splits: 'swarm'
  },
  {
    id: 'djinn',
    title: 'Djinn',
    plural: 'Djinn',
    drink: 'Anything in a bottle',
    level: 'grunt',
    species: 'demonoid',
    flags: ['magic-user'],
    xp: 2.5, // Average bottled beverage
    splits: 'imp'
  },
  {
    id: 'changeling',
    title: 'Changeling',
    drink: 'Any pint',
    level: 'grunt',
    species: 'fey',
    flags: ['group'],
    xp: 2.3, // Average pint
    splits: 'swarm'
  },
  {
    id: 'army',
    title: 'Army',
    plural: 'Armies',
    drink: 'Any kind of pint but all the same',
    level: 'grunt',
    species: 'special',
    flags: ['group'],
    xp: 2.3, // Average pint
    splits: 'swarm'
  },
  {
    id: 'plains_elf',
    title: 'Plains Elf',
    drink: 'Medium White Wine',
    level: 'grunt',
    species: 'elf',
    flags: ['mortal'],
    xp: 2.1, // 175ml at 12% ABV
    splits: 'forest_elf'
  },
  {
    id: 'trickster',
    title: 'Trickster',
    drink: 'Bartender\'s Choice',
    level: 'grunt',
    species: 'chameleonoid',
    flags: [],
    xp: 2.0, // Average value
    splits: 'mimic'
  },
  // Minion monsters
  {
    id: 'goblin',
    title: 'Goblin',
    drink: 'Half Pint Cider',
    level: 'minion',
    species: 'goblinoid',
    flags: ['mortal'],
    xp: 1.4 // Half pint (284ml) at ~5% ABV
  },
  {
    id: 'thrall_vampire',
    title: 'Thrall Vampire',
    drink: 'Small Red Wine',
    level: 'minion',
    species: 'vampire',
    flags: ['undead'],
    xp: 1.8 // 125ml at 14% ABV
  },
  {
    id: 'peasant',
    title: 'Peasant',
    drink: 'Half Pint Lager',
    level: 'minion',
    species: 'human',
    flags: ['mortal'],
    xp: 1.1 // Half pint (284ml) at ~4% ABV
  },
  {
    id: 'knight',
    title: 'Knight',
    drink: 'Half Pint of Strong Lager',
    level: 'minion',
    species: 'human',
    flags: ['mortal'],
    xp: 1.5 // Half pint (284ml) at ~5.2% ABV
  },
  {
    id: 'hedge_spirit',
    title: 'Hedge Sprite',
    drink: 'Gin',
    level: 'minion',
    species: 'fey',
    flags: ['spirit'],
    xp: 1.0 // Single (25ml) at 40% ABV
  },
  {
    id: 'spectral_soldier',
    title: 'Spectral Soldier',
    drink: 'House Whisky',
    level: 'minion',
    species: 'ghost',
    flags: ['spirit'],
    xp: 1.0 // Single (25ml) at 40% ABV
  },
  {
    id: 'desert_wisp',
    title: 'Desert Wisp',
    drink: 'Light Rum',
    level: 'minion',
    species: 'fey',
    flags: ['spirit'],
    xp: 1.0 // Single (25ml) at 40% ABV
  },
  {
    id: 'imp',
    title: 'Imp',
    drink: 'Dark Rum',
    level: 'minion',
    species: 'demonoid',
    flags: ['magic-user'],
    xp: 1.0 // Single (25ml) at 40% ABV
  },
  {
    id: 'mimic',
    title: 'Mimic',
    drink: 'Half pint of your choice',
    level: 'minion',
    species: 'chameleonoid',
    flags: [],
    xp: 1.2 // Average half pint
  },
 
  {
    id: 'swarm',
    title: 'Swarm',
    drink: 'Any kind of half pint of',
    level: 'minion',
    species: 'special',
    flags: ['group'],
    xp: 1.2 // Average half pint
  },
  {
    id: 'forest_elf',
    title: 'Forest Elf',
    drink: 'Small White Wine',
    level: 'minion',
    species: 'elf',
    flags: ['mortal'],
    xp: 1.5 // 125ml at 12% ABV
  },
  {
    id: 'sugar_sprite',
    title: 'Sugar Sprite',
    drink: 'Alchopop',
    level: 'minion',
    species: 'fey',
    flags: ['magic-user'],
    xp: 1.5 // Bottle (275ml) at ~5% ABV
  },
  {
    id: 'dwarf',
    title: 'Dwarf',
    drink: 'Half pint of Ale',
    level: 'minion',
    species: 'dwarf',
    flags: ['mortal'],
    xp: 1.1 // Half pint (284ml) at ~4% ABV
  },
  
  // Special monsters with unique abilities
  {
    id: 'desert_wyrm',
    title: 'Desert Wyrm',
    drink: 'Single Tequila',
    level: 'minion',
    species: 'demonoid',
    flags: ['magic-user'],
    xp: 1.0 // Single shot (25ml) at 40% ABV
  },
  {
    id: 'sand_titan',
    title: 'Sand Titan',
    drink: 'Double Tequila',
    level: 'grunt',
    species: 'demonoid',
    flags: ['mortal', 'magic-user'],
    xp: 2.0, // Double shot (50ml) at 40% ABV
    splits: 'desert_wyrm'
  },
  {
    id: 'fire_phantom',
    title: 'Fire Phantom',
    drink: 'Single Sambuca',
    level: 'minion',
    species: 'elemental',
    flags: ['spirit'],
    xp: 1.0 // Single shot (25ml) at 38% ABV
  },
  {
    id: 'azure_flame_elemental',
    title: 'Azure Flame Elemental',
    drink: 'Double Sambuca',
    level: 'grunt',
    species: 'elemental',
    flags: ['spirit', 'magic-user'],
    xp: 2.0, // Double shot (50ml) at 38% ABV
    splits: 'fire_phantom'
  },
  // Earth elementals for brandy
  {
    id: 'earth_shaper',
    title: 'Earth Shaper',
    drink: 'Single Brandy',
    level: 'minion',
    species: 'elemental',
    flags: ['spirit'],
    xp: 1.0 // Single shot (25ml) at ~40% ABV
  },
  {
    id: 'mountain_guardian',
    title: 'Mountain Guardian',
    drink: 'Double Brandy',
    level: 'grunt',
    species: 'elemental',
    flags: ['spirit', 'magic-user'],
    xp: 2.0, // Double shot (50ml) at ~40% ABV
    splits: 'earth_shaper'
  },
  // Water elementals for water
  {
    id: 'water_sprite',
    title: 'Water Sprite',
    drink: 'Small Glass of Water',
    level: 'minion',
    species: 'elemental',
    flags: ['magic-user'],
    xp: 0.0 // Glass of water (no alcohol content)
  },
  {
    id: 'tidal_guardian',
    title: 'Tidal Guardian',
    drink: 'Large Glass of Water',
    level: 'grunt',
    species: 'elemental',
    flags: ['magic-user'],
    xp: 0.0, // Large glass of water (no alcohol content)
    splits: 'water_sprite'
  },
  // Ice elementals
  {
    id: 'ice_shard',
    title: 'Ice Shard',
    drink: 'One Ice Cube',
    level: 'minion',
    species: 'elemental',
    flags: ['spirit'],
    xp: 0.0 // Ice has no alcohol
  },
  {
    id: 'frost_golem',
    title: 'Frost Golem',
    drink: 'Three Ice Cubes',
    level: 'grunt',
    species: 'elemental',
    flags: ['spirit'],
    xp: 0.0, // Ice has no alcohol
    splits: 'ice_shard'
  },
  {
    id: 'glacial_titan',
    title: 'Glacial Titan',
    drink: 'Pint of Ice Cubes',
    level: 'elite',
    species: 'elemental',
    flags: ['spirit', 'magic-user'],
    xp: 0.0, // Ice has no alcohol
    splits: 'frost_golem'
  },
  {
    id: 'obsidian_guardian',
    title: 'Obsidian Guardian',
    drink: 'Pint of Guinness',
    level: 'grunt',
    species: 'elemental',
    flags: [],
    xp: 2.3, // Pint (568ml) at ~4.2% ABV
    splits: 'obsidian_golem'
  },
  {
    id: 'obsidian_golem',
    title: 'Obsidian Golem',
    drink: 'Half Pint of Guinness',
    level: 'minion',
    species: 'elemental',
    flags: [],
    xp: 1.2 // Half pint (284ml) at ~4.2% ABV
  },
]

export function getRandomMonsterType(): string | null {
  const possibleMonsters = Object.entries(monsterTypes)
    .map(([id]) => id)
  
  if (possibleMonsters.length === 0) return null
  
  const randomIndex = Math.floor(Math.random() * possibleMonsters.length)
  return possibleMonsters[randomIndex]
}

// Branded types to make string IDs incompatible with regular strings and each other
export type GameLocationId = string & { __brand: 'GameLocationId' }
export type MonsterId = string & { __brand: 'MonsterId' }
export type MonsterTypeId = string & { __brand: 'MonsterTypeId' }
export type GameLocationTypeId = string & { __brand: 'GameLocationTypeId' }
export type ItemId = string & { __brand: 'ItemId' }

// Helper functions to cast string to branded types
export const toGameLocationId = (id: string): GameLocationId => id as GameLocationId
export const toGameLocationTypeId = (id: string): GameLocationTypeId => id as GameLocationTypeId
export const toMonsterId = (id: string): MonsterId => id as MonsterId
export const toMonsterTypeId = (id: string): MonsterTypeId => id as MonsterTypeId
export const toItemId = (id: string): ItemId => id as ItemId

// Item-related types
export type ItemPowerId = 
  | 'kill' 
  | 'transmute' 
  | 'spy'
  | 'shrink' 
  | 'split' 
  | 'pickpocket'
  | 'banish'
  | 'freeze'
  | 'petrify'
  | 'pacify'
  | 'distract'
  | 'vegetate'
  | 'stun'
  | 'token'
  | 'victory'
  | 'scoutRange'
  | 'lootbox'
  | 'grow'
  | 'treasure'

// Target modes - how the target is selected
export type MonsterTargetMode = 'random' | 'pick' | 'random_type' | 'pick_type' | undefined

// Result modes
export type ResultMode = 'random' | 'pick' | 'random_type' | 'pick_type' | undefined

// Unified Item interface
export interface Item {
  id: ItemId
  name: string
  description?: string  // A brief description of what the item does
  uses: number
  level: number
  power: ItemPowerId
  target?: MonsterTargetMode
  targetFilters?: {
    species?: Species[]
    flags?: MonsterFlag[]
  }
  maxLevel?: MonsterLevel
  result?: ResultMode
  resultSpecies?: Species
  icon?: string
  timestamp?: number  // To track when the item was added or updated
}

export type ItemTargetType = 'monsters'|'locations'|'special'|'none'

export interface Coordinates {
  lat: number
  lng: number
}

export interface GameLocation {
  id: GameLocationId
  name: string
  description?: string
  coordinates: Coordinates
  type: GameLocationTypeId
  difficulty?: GameLocationDifficulty
  monsters?: Monster[]
  scouted: boolean
  viewed: boolean
  hasToken?: boolean
  giftItem?: Item
  prizeItem?: Item
  defeatedEnemies: number
  hasBeenVisited: boolean
  wares? : Item[]
}

export interface GameLocationType {
  id: GameLocationTypeId
  title: string
  filename: string
  description?: string
  size: [number, number]
  anchor: [number, number]
  shadowSize: [number, number]
  shadowAnchor: [number, number]
  scale?: boolean
}

export type WeightedList<T> = {
  weight: number
  value: T
}[]

export type Encounter = {
  level: MonsterLevel;
  count: number;
}[]


export type Species = "vampire"|"ghost"|"human"|"chameleonoid"|"humanoid"|"demonoid"|"special"|"fey"|"elemental"|"nullified"
export type MonsterLevel  = "minion"|"grunt"|"elite"|"boss"
export type MonsterFlag = "spirit"|"undead"|"mortal"|"magic-user"|"group"
export type GameLocationDifficulty = "start" | "easy" | "medium" | "hard" | "end"

export interface MonsterType {
  id: MonsterTypeId
  title: string
  plural?: string
  drink: string
  level: MonsterLevel
  species: Species
  flags: MonsterFlag[]
  xp: number  // Experience points gained from defeating the monster
  booze: number // Alcohol booze (UK) in the drink
  soft: number // Soft drink consumption (water/soda) 
  lesser?: MonsterTypeId  // ID of monster that this monster splits into (smaller version of same species)
  lesserCount?: number | "playerCount"  // number of lesser monsters created when splitting (defaults to 2)
  // CSS styling properties
  style?: {
    background?: string          // Background gradient or color
    color?: string               // Text color
    borderColor?: string         // Border color
    animation?: string           // Animation name if any
    boxShadow?: string           // Box shadow
    additionalClasses?: string[] // Any additional classes
  }
}

export interface Monster {
  id: MonsterId;
  type: MonsterTypeId;
  name: string;
  alive: boolean;
  item?: Item;
}

export type ScreenId =
  | 'start_quest'
  | 'intro'
  | 'map'
  | 'location'
  | 'victory'

export type QuestState = 'no_quest' | 'init' | 'active' | 'completed'

export type GPSStatus = 'initializing' | 'loading' | 'success' | 'error' 

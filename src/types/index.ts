// Branded types to make string IDs incompatible with regular strings and each other
export type PubId = string & { __brand: 'PubId' }
export type MonsterId = string & { __brand: 'MonsterId' }
export type MonsterTypeId = string & { __brand: 'MonsterTypeId' }
export type LocationTypeId = string & { __brand: 'LocationTypeId' }
export type ItemId = string & { __brand: 'ItemId' }

// Helper functions to cast string to branded types
export const toPubId = (id: string): PubId => id as PubId
export const toLocationTypeId = (id: string): LocationTypeId => id as LocationTypeId
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

// Target modes - how the target is selected
export type TargetMode = 'random' | 'pick' | 'random_type' | 'pick_type' | 'location' | undefined

// Result modes
export type ResultMode = 'random' | 'pick' | 'random_type' | 'chosen_type' | undefined

// Unified Item interface
export interface Item {
  id: ItemId
  name: string
  description?: string  // A brief description of what the item does
  uses: number
  level: number
  power: ItemPowerId
  target?: TargetMode
  targetFilters?: {
    species?: Species[]
    levels?: MonsterLevel[]
    flags?: MonsterFlag[]
  }
  result?: ResultMode
  resultLevel?: MonsterLevel
  resultSpecies?: Species
  icon?: string
  timestamp?: number  // To track when the item was added or updated
}

export interface Location {
  lat: number
  lng: number
}

export interface Pub {
  id: PubId
  name: string
  description?: string
  lat: number
  lng: number
  locationType: LocationTypeId
  difficulty?: LocationDifficulty
  monsters?: Monster[]
  scouted: boolean
  giftItem?: Item
  prizeItem?: Item
}

export interface LocationType {
  id: LocationTypeId
  title: string
  filename: string
  description?: string
}

export type WeightedList<T> = {
  weight: number
  value: T
}[]

export type Encounter = {
  level: MonsterLevel;
  count: number;
}[]


export type Species = "vampire"|"ghost"|"human"|"chameleonoid"|"goblinoid"|"elf"|"demonoid"|"dwarf"|"special"|"fey"|"elemental"|"nullified"
export type MonsterLevel  = "minion"|"grunt"|"elite"|"boss"
export type MonsterFlag = "spirit"|"undead"|"mortal"|"magic-user"|"group"|"fey"
export type LocationDifficulty = "start" | "easy" | "medium" | "hard" | "end"

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
  lesserCount?: number | "playerCount"  // Number of lesser monsters created when splitting (defaults to 2)
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

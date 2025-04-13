export interface Location {
  lat: number
  lng: number
}

export type PubId = string

export type LocationTypeId = string


export interface Pub {
  id: PubId
  name: string
  description?: string
  lat: number
  lng: number
  locationType: LocationTypeId
  difficulty?: LocationDifficulty
  monsters?: Unit[]
  scouted: boolean
  prizeName?: string
  prizeDescription?: string
  giftItem?: Item
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


export type Species = "vampire"|"ghost"|"human"|"chameleonoid"|"goblinoid"|"elf"|"demonoid"|"dwarf"|"special"|"fey"
export type MonsterLevel  = "minion"|"grunt"|"elite"|"boss"
export type MonsterFlag = "spirit"|"undead"|"mortal"|"magic-user"|"group"
export type LocationDifficulty = "start" | "easy" | "medium" | "hard" | "end"

export interface MonsterType {
  id: string
  title: string
  plural?: string
  drink: string
  level: MonsterLevel
  species: Species
  flags: MonsterFlag[]
  xp: number  // Experience points (based on alcohol units)
}

export interface Unit {
  type: string
  name: string
  members: Enemy[]
  item?: Item
}

export interface Enemy {
  name: string
  alive: boolean
}

export type ScreenId =
  | 'start_quest'
  | 'intro'
  | 'info'
  | 'map'
    | 'location'
    | 'location_info'
  | 'inventory'
  | 'victory'

export type QuestState = 'no_quest' | 'active' | 'completed'

export type GPSStatus = 'initializing' | 'loading' | 'success' | 'error' 

export type ItemTypeId = 'healing' | 'transmute' | 'kill'

export interface Item {
  type: ItemTypeId
  target?: string
  name: string
  description: string
  uses: number
  level: number
}

export interface ItemType {
  id: ItemTypeId
  title: string
  description: string
  level: number
} 
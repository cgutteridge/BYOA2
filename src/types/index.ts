import { Item, ItemPower } from './item'

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


export type Species = "vampire"|"ghost"|"human"|"chameleonoid"|"goblinoid"|"elf"|"demonoid"|"dwarf"|"special"|"fey"|"elemental"
export type MonsterLevel  = "minion"|"grunt"|"elite"|"boss"
export type MonsterFlag = "spirit"|"undead"|"mortal"|"magic-user"|"group"|"fey"
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

export interface Monster {
  id: string;
  type: string;
  name: string;
  alive: boolean;
  item?: Item;
}

export type ScreenId =
  | 'start_quest'
  | 'intro'
  | 'info'
  | 'map'
    | 'location'
    | 'location_info'
  | 'victory'

export type QuestState = 'no_quest' | 'active' | 'completed'

export type GPSStatus = 'initializing' | 'loading' | 'success' | 'error' 

export interface ItemType {
  id: ItemPower
  title: string
  power: string
  level: number
} 
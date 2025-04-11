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
  monsters?: Monster[]
  scouted: boolean
  prizeName?: string
  prizeDescription?: string
}

export interface LocationType {
  id: LocationTypeId
  title: string
  filename: string
  description?: string
}

export type Species = "vampire"|"ghost"|"human"|"chameleonoid"|"goblinoid"|"elf"|"demonoid"|"dwarf"|"special"|"fey"
export type MonsterLevel  = "minion"|"grunt"|"elite"|"boss"
export type MonsterFlag = "spirit"|"undead"|"mortal"|"magic-user"|"group"

export interface MonsterType {
  id: string
  title: string
  plural?: string
  drink: string
  level: MonsterLevel
  species: Species
  flags: MonsterFlag[]
}

export interface Monster {
  type: string
  count: number
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
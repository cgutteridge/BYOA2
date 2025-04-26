import {MonsterFlag, MonsterLevel, MonsterType, MonsterTypeId, Species, toMonsterTypeId} from '../types';
// Import all monster type files
import vampiresData from './monsters/vampires.json';
import elvesData from './monsters/elves.json';
import faerieData from './monsters/faerie.json';
import pintsData from './monsters/pints.json';
import spiritsData from './monsters/spirits.json';
import nullifiedData from './monsters/nullified.json';
import otherData from './monsters/other.json';

// Type for the raw JSON data before applying branded types
interface RawMonsterData {
  id: string;
  title: string;
  plural?: string;
  drink: string;
  level: MonsterLevel;
  species: Species;
  flags: MonsterFlag[];
  xp: number;
  booze: number;
  soft?: number;
  lesser?: string;
  lesserCount?: number | "playerCount";
  style?: {
    background?: string;
    color?: string;
    borderColor?: string;
    animation?: string;
    boxShadow?: string;
    additionalClasses?: string[];
  };
}

// Combine all monster data with explicit type assertion
const monstersData: RawMonsterData[] = [
  ...(vampiresData as RawMonsterData[]),
  ...(elvesData as RawMonsterData[]),
  ...(faerieData as RawMonsterData[]),
  ...(pintsData as RawMonsterData[]),
  ...(spiritsData as RawMonsterData[]),
  ...(nullifiedData as RawMonsterData[]),
  ...(otherData as RawMonsterData[])
];

const errorBeast:MonsterType = {
  "id": toMonsterTypeId("error_beast"),
  "title": "Error Beast (something went wrong)",
  "drink": "Drink of your choice I guess",
  "level": "grunt",
  "species": "human",
  "flags": [
    "mortal"
  ],
  "xp": 20,
  "booze": 3.0,
  "soft": 0,
  "style": {
    "background": "#3333333",
    "color": "#cccccc",
    "borderColor": "#aaaaaa"
  }
}

export const monsterTypeById = (id: MonsterTypeId): MonsterType => {
  if(!monsterTypesById[id] ) {
    return errorBeast ;
  }
  return monsterTypesById[id];
}

// Parse the JSON data and apply the proper branded type to each ID
export const monsterTypes: MonsterType[] = monstersData.map(monster => {
  // Create a copy without the lesser property
  const { lesser, ...rest } = monster;
  
  // Create the base object with branded id
  const processed = {
    ...rest,
    id: toMonsterTypeId(monster.id)
  };
  
  // Add lesser with branded type if it exists
  if (lesser) {
    return {
      ...processed,
      lesser: toMonsterTypeId(lesser)
    } as MonsterType;
  }
  
  return processed as MonsterType;
});

// Create lookup map by ID
export const monsterTypesById: Record<MonsterTypeId, MonsterType> = monsterTypes.reduce((acc, monsterType) => {
  acc[monsterType.id] = monsterType;
  return acc;
}, {} as Record<MonsterTypeId, MonsterType>); 
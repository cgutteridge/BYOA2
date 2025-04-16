import monstersData from './monsterTypes.json';
import { 
  MonsterType, 
  MonsterTypeId, 
  toMonsterTypeId, 
  MonsterLevel, 
  Species, 
  MonsterFlag 
} from '../types';

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
  splits?: string;
}

// Parse the JSON data and apply the proper branded type to each ID
export const monsterTypes: MonsterType[] = (monstersData as RawMonsterData[]).map(monster => {
  // Create a copy without the splits property
  const { splits, ...rest } = monster;
  
  // Create the base object with branded id
  const processed = {
    ...rest,
    id: toMonsterTypeId(monster.id)
  };
  
  // Add splits with branded type if it exists
  if (splits) {
    return {
      ...processed,
      splits: toMonsterTypeId(splits)
    } as MonsterType;
  }
  
  return processed as MonsterType;
});

// Create lookup map by ID
export const monsterTypesById: Record<MonsterTypeId, MonsterType> = monsterTypes.reduce((acc, monsterType) => {
  acc[monsterType.id] = monsterType;
  return acc;
}, {} as Record<MonsterTypeId, MonsterType>); 
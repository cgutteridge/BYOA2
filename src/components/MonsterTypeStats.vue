<template>
  <div  class="monster-stats-debug">
    <h3>Monster Type Statistics</h3>
    
    <div class="stats-section">
      <h4>Monsters by Species</h4>
      <ul>
        <li v-for="(count, species) in speciesCounts" :key="species">
          {{ species }}: {{ count }}
        </li>
      </ul>
    </div>
    
    <div class="stats-section">
      <h4>Monsters by Level</h4>
      <ul>
        <li v-for="(count, level) in levelCounts" :key="level">
          {{ level }}: {{ count }}
        </li>
      </ul>
    </div>
    
    <div class="stats-section">
      <h4>Monsters by Flag</h4>
      <ul>
        <li v-for="(count, flag) in flagCounts" :key="flag">
          {{ flag }}: {{ count }}
        </li>
      </ul>
    </div>
    
    <div class="stats-section">
      <h4>Species by Level</h4>
      <div v-for="(levels, species) in speciesByLevel" :key="species" class="species-level-group">
        <h5>{{ species }}</h5>
        <ul>
          <li v-for="(count, level) in levels" :key="level">
            {{ level }}: {{ count }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { monsterTypes } from '@/data/monsterTypes';
import type { MonsterLevel, MonsterFlag, Species } from '@/types';

// Count monsters by species
const speciesCounts = computed<Record<Species, number>>(() => {
  const counts: Record<string, number> = {};
  
  monsterTypes.forEach(monster => {
    counts[monster.species] = (counts[monster.species] || 0) + 1;
  });
  
  return counts as Record<Species, number>;
});

// Count monsters by level
const levelCounts = computed<Record<MonsterLevel, number>>(() => {
  const counts: Record<string, number> = {};
  
  monsterTypes.forEach(monster => {
    counts[monster.level] = (counts[monster.level] || 0) + 1;
  });
  
  return counts as Record<MonsterLevel, number>;
});

// Count monsters by flag
const flagCounts = computed<Record<MonsterFlag, number>>(() => {
  const counts: Record<string, number> = {};
  
  monsterTypes.forEach(monster => {
    monster.flags.forEach(flag => {
      counts[flag] = (counts[flag] || 0) + 1;
    });
  });
  
  return counts as Record<MonsterFlag, number>;
});

// Count monsters grouped by species and level
const speciesByLevel = computed<Record<Species, Record<MonsterLevel, number>>>(() => {
  const counts: Record<string, Record<string, number>> = {};
  
  monsterTypes.forEach(monster => {
    if (!counts[monster.species]) {
      counts[monster.species] = {};
    }
    
    counts[monster.species][monster.level] = (counts[monster.species][monster.level] || 0) + 1;
  });
  
  return counts as Record<Species, Record<MonsterLevel, number>>;
});
</script>

<style scoped>
.monster-stats-debug {
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.9rem;
}

.monster-stats-debug h3 {
  margin-top: 0;
  font-size: 1.2rem;
  color: rgba(255, 50, 50, 0.9);
}

.monster-stats-debug h4 {
  margin-top: 0.8rem;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.monster-stats-debug h5 {
  margin-top: 0.8rem;
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
}

.stats-section {
  margin-bottom: 1.5rem;
}

.species-level-group {
  margin-left: 1rem;
  margin-bottom: 1rem;
}

ul {
  list-style-type: none;
  padding-left: 1rem;
  margin: 0.5rem 0;
}

li {
  margin-bottom: 0.3rem;
}
</style> 
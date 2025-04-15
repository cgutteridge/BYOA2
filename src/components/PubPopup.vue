<template>
  <div class="pub-popup">
    <h2>{{ pub.name }}<template v-if="!pub.scouted"> ({{ locationType.title }})</template></h2>
    <div class="distance-info" v-if="playerDistance !== null">
      <span>{{ Math.round(playerDistance) }}m away</span>
    </div>
    
    <div class="pub-details">
      <div v-if="pub.scouted && pub.description">
        <div class="location-description">{{ pub.description }}</div>
        <div v-if="pub.prizeItem" class="prize-info">
          <h3>Reward:</h3>
          <ItemCard 
            :item="pub.prizeItem"
            variant="prize"
            :show-details="true"
          />
          <div v-if="pub.prizeItem.description" class="prize-story">
            <div class="story-label">Story:</div>
            <div class="story-text">{{ pub.prizeItem.description }}</div>
          </div>
        </div>
        <h3 class="monsters-heading">Active Monsters:</h3>
        
        <!-- Show a message when all monsters are defeated -->
        <div v-if="allMonstersDefeated" class="all-defeated-message">
          All monsters have been defeated!
        </div>
        
        <!-- Group monsters by type and display -->
        <div v-else-if="groupedMonsters.length > 0" class="monster-groups">
          <div v-for="(group, gIndex) in groupedMonsters" :key="gIndex" class="monster-type-group">
            <div 
              class="monster-card"
              :class="getMonsterClasses(group.type)"
            >
              <div class="monster-count">
                <span>{{ group.monsters.length }}x</span>
              </div>
              <div class="monster-info">
                <div class="monster-title">{{ getMonsterTitle(group.type) }}</div>
                <div class="monster-subinfo">{{ getMonsterSpecies(group.type) }} {{ getMonsterLevel(group.type) }}{{ getMonsterTraits(group.type) }}</div>
                <div class="monster-xp">{{ getMonsterXP(group.type) }} XP</div>
                <div class="monster-details">
                  <div class="monster-stat"><strong>Drink:</strong> {{ getMonsterDrink(group.type) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Loading state when scouting -->
      <div v-else-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Scouting location...</p>
      </div>

    </div>
    
    <div class="action-buttons">
      <button v-if="!pub.scouted && !isLoading" @click="scoutPub" class="scout-button">Scout Location</button>
      <button @click="enterPub" v-if="isNearby" class="enter-button">Enter Location</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Pub, Monster, LocationType } from '../types'
import { useAppStore } from "../stores/appStore"
import { locationTypesById } from '@/data/locationTypes'
import { monsterTypes } from '../data/monsterTypes'
import { scoutLocation } from '@/quest/scoutLocation.ts'
import calculateDistance from '@/utils/calculateDistance.ts'
import ItemCard from './ItemCard.vue'
import '../styles/monsterStyles.css'

const props = defineProps<{
  pub: Pub
}>()

const emit = defineEmits(['close'])

const appStore = useAppStore()

const locationType = computed((): LocationType => locationTypesById[props.pub.locationType])

const playerDistance = computed(() => {
  if (!appStore.playerLocation) return null;
  
  return calculateDistance(
    appStore.playerLocation.lat,
    appStore.playerLocation.lng,
    props.pub.lat,
    props.pub.lng
  );
});

// Check if player is within range to interact with the pub
const isNearby = computed(() => {
  return playerDistance.value !== null && playerDistance.value < 500; // 500 meters range
});

// Group undefeated monsters by type for display
const groupedMonsters = computed(() => {
  if (!props.pub?.monsters || !props.pub.monsters.length) {
    return [];
  }
  
  // Group undefeated monsters by type
  const monstersByType = new Map<string, {
    type: string,
    monsters: Monster[]
  }>();
  
  // Only include monsters that are still alive
  props.pub.monsters.forEach(monster => {
    // Skip defeated monsters
    if (!monster.alive) return;
    
    if (!monstersByType.has(monster.type)) {
      monstersByType.set(monster.type, {
        type: monster.type,
        monsters: []
      });
    }
    
    const group = monstersByType.get(monster.type)!;
    group.monsters.push(monster);
  });
  
  // Filter out empty groups
  const nonEmptyGroups = Array.from(monstersByType.values())
    .filter(group => group.monsters.length > 0);
  
  return nonEmptyGroups;
});

// Check if all monsters are defeated
const allMonstersDefeated = computed(() => {
  if (!props.pub?.monsters || props.pub.monsters.length === 0) {
    return false;
  }
  
  return props.pub.monsters.every(monster => !monster.alive);
});

const isLoading = computed(() => {
  return props.pub.scouted && !props.pub.description;
})

function getMonsterTitle(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  return monster?.title || monsterId
}

function getMonsterDrink(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  return monster?.drink || "Unknown"
}

function getMonsterXP(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (monster?.xp !== undefined) {
    // If XP is a whole number, show as integer, otherwise show one decimal place
    return monster.xp % 1 === 0 ? monster.xp.toString() : monster.xp.toFixed(1);
  }
  return "Unknown";
}

function getMonsterClasses(monsterId: string): Record<string, boolean> {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster) return {}
  
  const classes = {
    [`monster-${monster.species}`]: true,
    [`monster-${monster.level}`]: true
  }
  
  // Add special classes for themed monsters
  if (monster.id.includes('desert') || monster.id.includes('sand')) {
    classes['desert-monster'] = true
  } else if (monster.id.includes('flame') || monster.id.includes('fire')) {
    classes['flame-monster'] = true
  } else if (monster.id.includes('earth') || monster.id.includes('mountain')) {
    classes['earth-monster'] = true
  } else if (monster.id.includes('water') || monster.id.includes('tidal')) {
    classes['water-monster'] = true
  } else if (monster.id.includes('ice') || monster.id.includes('frost') || monster.id.includes('glacial')) {
    classes['ice-monster'] = true
  } else if (monster.id.includes('obsidian')) {
    classes['obsidian-monster'] = true
  }
  
  return classes
}

function getMonsterSpecies(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster) return ""
  
  // Capitalize first letter of species
  return monster.species.charAt(0).toUpperCase() + monster.species.slice(1)
}

function getMonsterLevel(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster) return ""
  
  // Capitalize first letter of level
  return monster.level.charAt(0).toUpperCase() + monster.level.slice(1)
}

function getMonsterTraits(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster || !monster.flags || monster.flags.length === 0) return ""
  
  return `, ${monster.flags.join(', ')}`
}

function scoutPub(event: MouseEvent) {
  event.stopPropagation()
  scoutLocation(props.pub)
}

function enterPub(event: MouseEvent) {
  event.stopPropagation()
  console.log( 'enter pub' )
}

</script>

<style scoped>
.pub-popup {
  color: white;
  padding: 5px;
  max-width: 100%;
  font-size: 16px;
}

h2 {
  font-size: 1.4rem;
  margin-top: 0;
  margin-bottom: 0.75rem;
  text-align: center;
  color: #fff;
}

.distance-info {
  font-size: 1rem;
  margin-bottom: 1rem;
  text-align: center;
  color: #8bc34a;
  font-weight: bold;
}

.pub-details {
  margin: 1rem 0;
}

.location-description {
  margin-bottom: 1.25rem;
  font-size: 1rem;
  line-height: 1.5;
}

.prize-info {
  margin: 1.25rem 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  text-align: left;
}

.prize-info h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  text-align: center;
  color: #ffeb3b;
  font-size: 1.2rem;
}

/* Styling modifications for ItemCard inside prize-info */
.prize-info :deep(.item-card) {
  margin: 0.5rem 0 1rem;
  max-width: 100%;
  border-width: 2px;
  background-color: rgba(255, 255, 255, 0.9);
}

.prize-info :deep(.item-card__power) {
  white-space: normal;
  line-height: 1.2;
}

.prize-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
  color: #fff;
  text-align: center;
}

.prize-details {
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

.prize-label {
  font-weight: bold;
  color: #8bc34a;
}

.prize-story {
  font-size: 0.9rem;
  font-style: italic;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.story-label {
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: #ffeb3b;
}

.monsters-heading {
  font-size: 1.2rem;
  margin: 1.25rem 0 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
  color: #fff;
}

.monster-groups {
  margin: 0.75rem 0;
}

.monster-type-group {
  margin-bottom: 1rem;
}

/* Monster card styling */
.monster-card {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  margin: 0.5rem 0;
}

.monster-count {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  font-size: 2rem;
  font-weight: 900;
  background: rgba(0, 0, 0, 0.3);
  min-width: 80px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.monster-info {
  flex: 1;
  padding: 0.75rem 1rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.monster-title {
  font-weight: bold;
  font-size: 1.3rem;
  margin-bottom: 0.25rem;
  padding-right: 60px; /* Make room for XP */
  color: #ffeb3b;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.monster-subinfo {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  font-style: italic;
}

.monster-xp {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  font-size: 0.9rem;
  font-weight: bold;
}

.monster-details {
  display: flex;
  gap: 1.5rem;
}

.monster-stat {
  font-size: 0.95rem;
}

.all-defeated-message {
  margin: 1rem 0;
  padding: 1rem;
  font-style: italic;
  color: #4CAF50;
  font-weight: bold;
  text-align: center;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.3);
  font-size: 1rem;
}

.unscouted-message {
  margin: 1rem 0;
  padding: 1rem;
  font-style: italic;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

button {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  flex: 1;
  min-width: 120px;
  transition: background-color 0.2s ease;
  font-weight: bold;
}

.scout-button {
  background: #ff9800;
  color: white;
}

.scout-button:hover {
  background: #f57c00;
}

.enter-button {
  background: #4CAF50;
  color: white;
}

.enter-button:hover {
  background: #388E3C;
}

.close-button {
  background: #757575;
  color: white;
}

.close-button:hover {
  background: #616161;
}

button:disabled {
  background: #9e9e9e;
  color: rgba(255, 255, 255, 0.7);
  cursor: not-allowed;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #4CAF50;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 
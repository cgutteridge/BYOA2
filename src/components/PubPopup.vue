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
          <div class="prize-name">{{ pub.prizeItem.name }}</div>
          <div class="prize-details">
            <span class="prize-label">Effect:</span> {{ generateEffectDescription(pub.prizeItem) }}
          </div>
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
          <div v-for="(group, gIndex) in groupedMonsters" :key="gIndex" class="monster-group">
            <div class="monster-group-header">
              <h4>{{ getMonsterTitle(group.type) }} ({{ group.monsters.length }})</h4>
              <div class="monster-details">
                <span class="monster-drink">
                  <span class="detail-label">Drink:</span> {{ getMonsterDrink(group.type) }}
                </span>
                <span class="monster-traits" v-if="getMonsterTraits(group.type)">
                  {{ getMonsterTraits(group.type) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="!pub.scouted" class="unscouted-message">
        <p>This location has not been scouted yet. Visit it to learn more!</p>
      </div>
    </div>
    
    <div class="action-buttons">
      <button v-if="!pub.scouted" @click="scoutPub" class="scout-button">Scout Location</button>
      <button @click="enterPub" :disabled="!pub.scouted || !isNearby" class="enter-button">Enter Location</button>
      <button @click="closePopup" class="close-button">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits } from 'vue'
import type { Pub, Monster, LocationType } from '../types'
import { useAppStore } from "../stores/appStore"
import { locationTypesById } from '@/data/locationTypes'
import { monsterTypes } from '../data/monsterTypes'
import { scoutLocation } from '@/quest/scoutLocation.ts'
import calculateDistance from '@/utils/calculateDistance.ts'
import { generateEffectDescription } from '@/quest/generateEffectDescription.ts'

const props = defineProps<{
  pub: Pub
}>()

const emit = defineEmits(['close', 'scout', 'enter'])

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

function getMonsterTitle(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  return monster?.title || monsterId
}

function getMonsterDrink(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  return monster?.drink || "Unknown"
}

function getMonsterTraits(monsterId: string): string {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster || !monster.flags || monster.flags.length === 0) return ""
  
  return `, ${monster.flags.join(', ')}`
}

function scoutPub() {
  scoutLocation(props.pub)
  emit('scout', props.pub.id)
}

function enterPub() {
  emit('enter', props.pub.id)
}

function closePopup() {
  emit('close')
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
  margin-bottom: 0.5rem;
  text-align: center;
  color: #ffeb3b;
  font-size: 1.2rem;
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

.monster-group {
  margin-bottom: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
}

.monster-group-header h4 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #fff;
}

.monster-details {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}

.detail-label {
  font-weight: bold;
  color: #8bc34a;
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
</style> 
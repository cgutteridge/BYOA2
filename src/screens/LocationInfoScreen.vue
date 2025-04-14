<template>
  <div class="location-info-screen screen-container">
    <div class="location-info">
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
              <span class="prize-label">Power:</span> {{ pub.prizeItem.power }}
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
          <div v-for="(group, index) in groupedMonsters" :key="index" class="monster-type-group">
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
        
        <div v-else-if="pub.scouted && !pub.description" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Gathering information...</p>
        </div>
        
        <div v-else class="scout-options">
          <p>No information available about this pub.</p>
          <div class="action-buttons">
            <button @click="callScoutPub" :disabled="!pubStore.canScout(pub.id)">Scout</button>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button v-if="pub.scouted && pub.description" @click="enterPub">Enter Pub</button>
        <button @click="returnToMap">Return to Map</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import calculateDistance from "../helpers/calculateDistance";
import {useAppStore} from "../stores/appStore";
import {useQuestStore} from "../stores/questStore";
import {usePubStore} from "../stores/pubStore";
import {locationTypesById} from "@/data/locationTypes.ts";
import {LocationType, Monster, Pub} from "@/types";
import {scoutPub} from "@/helpers/scoutPub.ts";
import {monsterTypes} from "../data/monsterTypes";
import '../styles/monsterStyles.css';

const appStore = useAppStore()
const questStore = useQuestStore()
const pubStore = usePubStore()
const pub = computed(() => {
      return appStore.focusPub as Pub
    }
)
const locationType = computed((): LocationType => locationTypesById[pub.value.locationType])

const playerDistance = computed(() => {
  if (!appStore.playerLocation || !appStore.focusPub) return null;
  
  return calculateDistance(
    appStore.playerLocation.lat,
    appStore.playerLocation.lng,
    appStore.focusPub.lat,
    appStore.focusPub.lng
  );
});

// Group undefeated monsters by type for display
const groupedMonsters = computed(() => {
  if (!appStore.focusPub?.monsters || !appStore.focusPub.monsters.length) {
    return [];
  }
  
  // Group undefeated monsters by type
  const monstersByType = new Map<string, {
    type: string,
    monsters: Monster[]
  }>();
  
  // Only include monsters that are still alive
  appStore.focusPub.monsters.forEach(monster => {
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
  if (!appStore.focusPub?.monsters || appStore.focusPub.monsters.length === 0) {
    return false;
  }
  
  return appStore.focusPub.monsters.every(monster => !monster.alive);
});

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
  } else if (monster.id.includes('flame')) {
    classes['flame-monster'] = true
  } else if (monster.id.includes('frost')) {
    classes['frost-monster'] = true
  } else if (monster.id.includes('earth') || monster.id.includes('mountain')) {
    classes['earth-monster'] = true
  } else if (monster.id.includes('water') || monster.id.includes('tidal')) {
    classes['water-monster'] = true
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

function callScoutPub() {
  if (!appStore.focusPub) return
  scoutPub(appStore.focusPub)
}

function enterPub() {
  if (!appStore.focusPub) return
  appStore.setScreen('location')
  questStore.setCurrentPub(appStore.focusPub.id)
}

function returnToMap() {
  appStore.setScreen('map')
}
</script>

<style scoped>
.location-info-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: white;
  padding: 2rem 0;
}

.location-info {
  max-width: 800px;
  width: 90%;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-align: center;
  margin: auto;
}

.pub-details {
  margin: 1.5rem 0;
}

.description {
  font-style: italic;
  margin-top: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

button {
  padding: 0.8rem 1.5rem;
  font-size: 1.1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

button:disabled {
  background: #666;
  cursor: not-allowed;
}

.location-description {
  margin-bottom: 1.25rem;
}

.prize-info {
  margin: 1.25rem 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  text-align: left;
}

.prize-info h3 {
  margin-bottom: 0.5rem;
  text-align: center;
  color: #ffeb3b;
}

.prize-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #fff;
  text-align: center;
}

.prize-details {
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
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
  color: #ffeb3b;
  margin-bottom: 0.25rem;
  font-style: normal;
}

.story-text {
  font-style: italic;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
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

.location-info h2 {
  margin-bottom: 0.25rem;
}

.distance-info {
  display: inline-block;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.location-info h3 {
  margin-bottom: 0.25rem;
  margin-top: 0.5rem;
}

.monsters-heading {
  margin-bottom: 0.5rem !important;
  margin-top: 0.75rem !important;
}

.monster-type-group {
  margin-bottom: 1rem;
}

.all-defeated-message {
  margin: 1rem 0 2rem;
  padding: 1rem;
  font-style: italic;
  color: #4CAF50;
  font-weight: bold;
  text-align: center;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.3);
}
</style> 
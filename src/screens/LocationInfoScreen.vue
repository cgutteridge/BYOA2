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
          <div class="prize-info">
            <h3>Reward:</h3>
            <div>{{ pub.prizeName }}</div>
          </div>
          <h3 class="monsters-heading">Monsters Present:</h3>
          <div 
            v-for="(monster, index) in appStore.focusPub?.monsters" 
            :key="index" 
            class="monster-card"
            :class="getMonsterClasses(monster.type)"
          >
            <div class="monster-count">
              <span>{{ monster.count }}x</span>
            </div>
            <div class="monster-info">
              <div class="monster-title">{{ getMonsterTitle(monster.type) }}</div>
              <div class="monster-xp">{{ getMonsterXP(monster.type) }} XP</div>
              <div class="monster-details">
                <div class="monster-stat"><strong>Drink:</strong> {{ getMonsterDrink(monster.type) }}</div>
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
            <button @click="callScoutPub" :disabled="!canScout">Scout</button>
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
import {locationTypesById} from "@/data/locationTypes.ts";
import {LocationType, Pub} from "@/types";
import {scoutPub} from "@/helpers/scoutPub.ts";
import {monsterTypes} from "../data/monsterTypes";
import '../styles/monsterStyles.css';

const appStore = useAppStore()
const questStore = useQuestStore()
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

const canScout = computed(() => {
  if (!playerDistance.value) return false;
  // 50 meters is the scouting distance
  return playerDistance.value <= 50;
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
  return monster?.xp ? monster.xp.toFixed(1) : "Unknown"
}

function getMonsterClasses(monsterId: string): Record<string, boolean> {
  const monster = monsterTypes.find(m => m.id === monsterId)
  if (!monster) return {}
  
  return {
    [`monster-${monster.species}`]: true,
    [`monster-${monster.level}`]: true
  }
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
}

.prize-info h3 {
  margin-bottom: 0.25rem;
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
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
  padding-right: 60px; /* Make room for XP */
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
</style> 
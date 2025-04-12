<template>
  <div class="location-info-screen screen-container">
    <div class="location-info">
      <h2>{{ pub.name }}</h2>
      <h3>{{ locationType.title }}</h3>
      <div class="difficulty-badge" :class="difficultyClass">
        {{ difficultyName }}
      </div>

      <div class="pub-details">
        <div v-if="pub.scouted && pub.description">
          <div class="location-description">{{ pub.description }}</div>
          <div class="prize-info">
            <h3>Reward:</h3>
            <div>{{ pub.prizeName }}</div>
          </div>
          <h3>Monsters Present:</h3>
          <div v-for="(monster, index) in appStore.focusPub?.monsters" :key="index" class="monster">
            <p>{{ monster.type }} (x{{ monster.count }})</p>
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

const appStore = useAppStore()
const questStore = useQuestStore()
const pub = computed(() => {
      return appStore.focusPub as Pub
    }
)
const locationType = computed((): LocationType => locationTypesById[pub.value.locationType])

const canScout = computed(() => {
  if (!appStore.playerLocation || !appStore.focusPub) return false

  const distance = calculateDistance(
      appStore.playerLocation.lat,
      appStore.playerLocation.lng,
      appStore.focusPub.lat,
      appStore.focusPub.lng
  )
  
  return distance <= 50
})

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

// Get the difficulty name for display
const difficultyName = computed(() => {
  if (!pub.value || !pub.value.difficulty) {
    return 'MEDIUM'
  }
  return pub.value.difficulty.toUpperCase()
})

// Determine CSS class based on difficulty
const difficultyClass = computed(() => {
  if (!pub.value || !pub.value.difficulty) {
    return 'medium'
  }
  return pub.value.difficulty
})
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
  margin: 2rem 0;
}

.monster-info {
  margin-top: 2rem;
}

.monster {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
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
  transition: background 0.3s ease;
}

button:hover:not(:disabled) {
  background: #45a049;
}

button:disabled {
  background: #666;
  cursor: not-allowed;
}

.difficulty-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  font-weight: bold;
}

.start {
  background-color: #4CAF50;
  color: white;
}

.easy {
  background-color: #8BC34A;
  color: black;
}

.medium {
  background-color: #FFC107;
  color: black;
}

.hard {
  background-color: #FF5722;
  color: white;
}

.end {
  background-color: #F44336;
  color: white;
}

.location-description {
  margin-bottom: 2rem;
}

.prize-info {
  margin: 2rem 0;
}

.prize-info h3 {
  margin-bottom: 0.5rem;
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
</style> 
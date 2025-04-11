<template>
  <div class="location-info-screen">

    <div class="location-info">
      <h2>{{ pub.name }}</h2>
      <h3>{{ locationType.title }}</h3>

      <div class="pub-details">

        <div v-if="pub.scouted">
          <div>{{ pub.description }}</div>
          <div>Reward: {{ pub.prizeName }}</div>
          <h3>Monsters Present:</h3>
          <div v-for="(monster, index) in appStore.focusPub?.monsters" :key="index" class="monster">
            <p>{{ monster.type }} (x{{ monster.count }})</p>
          </div>
        </div>
        
        <div v-else class="scout-options">
          <p>No information available about this pub.</p>
          <div class="action-buttons">
            <button @click="scoutPub" :disabled="!canScout">Scout</button>
            <button @click="spyPub">Spy</button>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button v-if="pub.scouted" @click="enterPub">Enter Pub</button>
        <button @click="returnToMap">Return to Map</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import calculateDistance from "../helpers/calculateDistance";
import {useAppStore} from "../stores/appStore";
import {usePubStore} from "../stores/pubStore";
import {useQuestStore} from "../stores/questStore";
import {LocationType, Pub} from "../types";

const appStore = useAppStore()
const pubStore = usePubStore()
const questStore = useQuestStore()
const pub = computed(() => {
      return appStore.focusPub as Pub
    }
)
const locationType = computed(():LocationType => pubStore.getLocationTypeData(pub.value.locationType))

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

function scoutPub() {
  if (!appStore.focusPub) return
  pubStore.scoutPub(appStore.focusPub.id)
}

function spyPub() {
  if (!appStore.focusPub) return
  pubStore.scoutPub(appStore.focusPub.id)
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
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: white;
}

.location-info {
  max-width: 800px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-align: center;
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
</style> 
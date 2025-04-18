<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from 'vue'
import {useAppStore} from './stores/appStore'
import {useQuestStore} from './stores/questStore'
import {useInventoryStore} from './stores/inventoryStore'

import MapScreen from './screens/MapScreen.vue'
import QuestStartScreen from './screens/QuestStartScreen.vue'
import IntroScreen from './screens/IntroScreen.vue'
import LocationScreen from './screens/LocationScreen.vue'
import VictoryScreen from './screens/VictoryScreen.vue'
import InterfaceModal from './components/InterfaceModal.vue'
import ItemInspectModal from './components/ItemInspectModal.vue'
import NotificationSystem from './components/NotificationSystem.vue'
import formatNumber from "@/utils/formatNumber.ts";

const appStore = useAppStore()
const questStore = useQuestStore()
const inventoryStore = useInventoryStore()
const isDebugMode = ref(false)
const watchId = ref<number | null>(null)
const showButtonPulse = ref(false)

// Watch for inventory changes to trigger the pulse animation
watch(() => inventoryStore.itemCount, (newCount, oldCount) => {
  if (newCount > oldCount) {
    // Item was added, trigger pulse animation
    showButtonPulse.value = true;
    // Reset after animation completes
    setTimeout(() => {
      showButtonPulse.value = false;
    }, 1000);
  }
});

// Check if debug mode is enabled via URL fragment
function checkDebugMode() {
  isDebugMode.value = window.location.hash === '#DEBUG'
  console.log('Debug mode:', isDebugMode.value ? 'ENABLED' : 'disabled')
}

// Initialize the GPS once
async function initializeGPS() {
  try {
    // Check for debug mode
    checkDebugMode()
    
    // If in debug mode, use fixed coordinates for Southampton
    if (isDebugMode.value ) {
      const debugCoordinates = {lat: 50.91018, lng: -1.40419 } //southampton
      //const debugCoordinates = {lat: 49.0434, lng: 3.9562}// epernay
      console.log('DEBUG MODE: Using fixed GPS gameLocation:', debugCoordinates)
      appStore.setPlayerCoordinates(debugCoordinates)
      appStore.setGPSStatus('success')
      return
    }
    
    // Normal GPS initialization
    if (!navigator.geolocation) {
      appStore.setGPSStatus('error')
      return
    }

    appStore.setGPSStatus('loading')
    
    // Set up continuous watching of gameLocation
    startContinuousTracking()
  } catch (error) {
    console.error('GPS error:', error)
    appStore.setGPSStatus('error')
  }
}

// Start continuous GPS tracking
function startContinuousTracking() {
  console.log('Starting continuous GPS tracking')
  if (!navigator.geolocation) {
    appStore.setGPSStatus('error')
    return
  }
  
  // Debug mode doesn't need continuous tracking - it's handled in initializeGPS
  if (isDebugMode.value ){
    return
  }
 
  // In normal mode, use geogameLocation.watchPosition
  watchId.value = navigator.geolocation.watchPosition(
    (position) => {
      const coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      
      console.log('GPS update:', coordinates)
      appStore.setPlayerCoordinates(coordinates)
      appStore.setGPSStatus('success')
    },
    (error) => {
      console.error('GPS tracking error:', error)
      if (appStore.gpsStatus !== 'success') {
        appStore.setGPSStatus('error')
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  )
}

// Stop GPS tracking
function stopContinuousTracking() {
  console.log('Stopping GPS tracking')
  if (!isDebugMode.value  && watchId.value !== null) {
    navigator.geolocation.clearWatch(watchId.value)
    watchId.value = null
  }
}

function toggleInterface() {
  appStore.toggleInterface()
}



onMounted(() => {
  console.log('App mounted, initializing GPS...')
  initializeGPS()
  
  // Listen for hash changes to toggle debug mode
  window.addEventListener('hashchange', () => {
    stopContinuousTracking()
    checkDebugMode()
    initializeGPS() // Re-initialize GPS when debug mode changes
  })

})

onUnmounted(() => {
  // Clean up the continuous tracking when the component is unmounted
  stopContinuousTracking()
  
  // Remove keyboard listener
  window.removeEventListener('keydown', (e) => {
    if (e.key === 'i' || e.key === 'I') {
      toggleInterface()
    }
  })
})
</script>

<template>
  <div class="app">
    <div v-if="isDebugMode" class="debug-banner">DEBUG MODE</div>

    <NotificationSystem />
    
    <div class="debug-overlay" v-if="appStore.playerCoordinates">
      <div>COORDS: {{ appStore.playerCoordinates.lat.toFixed(5) }}, {{ appStore.playerCoordinates.lng.toFixed(5) }}</div>
      <div>XP: {{ questStore.xp }} | Booze: {{ formatNumber(questStore.booze) }} | Soft: {{ formatNumber(questStore.soft) }}</div>
    </div>
    
    <div v-if="appStore.gpsStatus === 'initializing'" class="gps-status">
      <div class="loading-spinner"></div>
      <p>Awaiting GPS...</p>
    </div>
    <div v-else-if="appStore.gpsStatus === 'loading'" class="gps-status">
      <div class="loading-spinner"></div>
      <p>Getting your gameLocation...</p>
    </div>
    <div v-else-if="appStore.gpsStatus === 'error'" class="gps-error">
      <p>Unable to get your gameLocation. Please enable GPS and refresh the page.</p>
      <p>
        <a href="#DEBUG">Enable Debug Mode</a></p>
    </div>
    <template v-else>
      <!-- Normal game screens -->
      <QuestStartScreen v-if="appStore.screen === 'start_quest'" />
      <IntroScreen v-else-if="appStore.screen === 'intro'" />
      <MapScreen v-else-if="appStore.screen === 'map'" />
      <LocationScreen v-else-if="appStore.screen === 'gameLocation'" />
      <VictoryScreen v-else-if="appStore.screen === 'victory'" />

      <!-- Interface Button (only show during gameplay) -->
      <button 
        v-if="(appStore.screen !== 'start_quest' && 
              appStore.screen !== 'intro' && 
              appStore.screen !== 'victory')"
        class="interface-button"
        :class="{ 'pulse-animation': showButtonPulse }"
        @click="toggleInterface"
        title="Open Interface (I)"
      >
        🎒
      </button>
      
      <!-- Interface Modal -->
      <InterfaceModal />
      
      <!-- Global ItemInspectModal -->
      <ItemInspectModal v-if="appStore.inspectedItem" />
    </template>
  </div>
</template>

<style>
.app {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  overflow-x: hidden;
}

.interface-button {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #4a8;
  color: white;
  font-size: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 100;
  border: none;
  transition: all 0.2s ease;
  padding: 0;
}

.interface-button:hover {
  transform: scale(1.1);
  background-color: #3a7;
}

/* Pulse animation for new item */
.pulse-animation {
  animation: pulse 1s cubic-bezier(0.66, 0, 0, 1);
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  50% {
    transform: scale(1.2);
    box-shadow: 0 0 20px rgba(74, 136, 80, 0.8);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}

.gps-status, .gps-error {
  text-align: center;
  padding: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

.debug-overlay {
  position: fixed;
  bottom: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 50%;
  z-index: 9999;
  pointer-events: none; /* Pass through clicks */
  font-family: monospace;
}

.debug-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(200, 50, 50, 0.85);
  color: white;
  text-align: center;
  padding: 5px;
  font-weight: bold;
  z-index: 9999;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>

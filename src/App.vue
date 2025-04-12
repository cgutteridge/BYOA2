<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { useAppStore } from './stores/appStore'

import MapScreen from './screens/MapScreen.vue'
import QuestStartScreen from './screens/QuestStartScreen.vue'
import IntroScreen from './screens/IntroScreen.vue'
import InfoScreen from './screens/InfoScreen.vue'
import LocationScreen from './screens/LocationScreen.vue'
import InventoryScreen from './screens/InventoryScreen.vue'
import VictoryScreen from './screens/VictoryScreen.vue'
import LocationInfoScreen from "./screens/LocationInfoScreen.vue";

const appStore = useAppStore()
const isDebugMode = ref(false)
const watchId = ref<number | null>(null)

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
    if (isDebugMode.value) {
      const debugLocation = {
        lat: 50.91018,
        lng: -1.40419
      }
      console.log('DEBUG MODE: Using fixed GPS location:', debugLocation)
      appStore.setPlayerLocation(debugLocation)
      appStore.setGPSStatus('success')
      return
    }
    
    // Normal GPS initialization
    if (!navigator.geolocation) {
      appStore.setGPSStatus('error')
      return
    }

    appStore.setGPSStatus('loading')
    
    // Set up continuous watching of location
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
  if (isDebugMode.value) {
    return
  }
 
  // In normal mode, use geolocation.watchPosition
  watchId.value = navigator.geolocation.watchPosition(
    (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      
      console.log('GPS update:', location)
      appStore.setPlayerLocation(location)
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
  if (!isDebugMode.value && watchId.value !== null) {
    navigator.geolocation.clearWatch(watchId.value)
    watchId.value = null
  }
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
})
</script>

<template>
  <div class="app">
    <div v-if="isDebugMode" class="debug-banner">DEBUG MODE</div>
    
    <div v-if="appStore.gpsStatus === 'initializing'" class="gps-status">
      <div class="loading-spinner"></div>
      <p>Awaiting GPS...</p>
    </div>
    <div v-else-if="appStore.gpsStatus === 'loading'" class="gps-status">
      <div class="loading-spinner"></div>
      <p>Getting your location...</p>
    </div>
    <div v-else-if="appStore.gpsStatus === 'error'" class="gps-error">
      <p>Unable to get your location. Please enable GPS and refresh the page.</p>
      <p><a href="#DEBUG">Enable Debug Mode</a></p>
    </div>
    <template v-else>
      <QuestStartScreen v-if="appStore.screen === 'start_quest'" />
      <IntroScreen v-else-if="appStore.screen === 'intro'" />
      <InfoScreen v-else-if="appStore.screen === 'info'" />
      <MapScreen v-else-if="appStore.screen === 'map'" />
      <LocationScreen v-else-if="appStore.screen === 'location'" />
      <LocationInfoScreen v-else-if="appStore.screen === 'location_info'" />
      <InventoryScreen v-else-if="appStore.screen === 'inventory'" />
      <VictoryScreen v-else-if="appStore.screen === 'victory'" />
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

.screen-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
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

.debug-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #f00;
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

button:hover {
  background-color: #45a049;
}
</style>

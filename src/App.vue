<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from 'vue'
import {useAppStore} from './stores/appStore'
import {useInventoryStore} from './stores/inventoryStore'
import {useQuestStore} from './stores/questStore'

import MapScreen from '@/components/screens/MapScreen.vue'
import StartScreen from '@/components/screens/StartScreen.vue'
import IntroScreen from '@/components/screens/IntroScreen.vue'
import LocationScreen from '@/components/screens/LocationScreen.vue'
import VictoryScreen from '@/components/screens/VictoryScreen.vue'
import InterfaceModal from './components/InterfaceModal.vue'
import ItemModal from './components/ItemModal.vue'
import NotificationSystem from './components/NotificationSystem.vue'

const appStore = useAppStore()
const inventoryStore = useInventoryStore()
const questStore = useQuestStore()
const watchId = ref<number | null>(null)
const showButtonPulse = ref(false)
const hashChangeListener = ref<((event: HashChangeEvent) => void) | null>(null)
const beforeUnloadHandler = ref<((event: BeforeUnloadEvent) => void) | null>(null)

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

// Initialize the GPS once
async function initializeGPS() {
  try {
    // If in debug mode, use fixed coordinates for Southampton
    if (questStore.isDebugMode) {
      const debugCoordinates = {lat: 50.92385, lng: -1.39501} // Southampton
      //const debugCoordinates = {lat: 49.0434, lng: 3.9562}// Epernay
      // console.log('DEBUG MODE: Using fixed GPS location:', debugCoordinates)
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
    
    // Set up continuous watching of location
    startContinuousTracking()
  } catch (error) {
    console.error('GPS error:', error)
    appStore.setGPSStatus('error')
  }
}

// Start continuous GPS tracking
function startContinuousTracking() {
  // console.log('Starting continuous GPS tracking')
  if (!navigator.geolocation) {
    appStore.setGPSStatus('error')
    return
  }
  
  // Debug mode doesn't need continuous tracking - it's handled in initializeGPS
  if (questStore.isDebugMode){
    return
  }
 
  // In normal mode, use geolocation.watchPosition
  watchId.value = navigator.geolocation.watchPosition(
    (position) => {
      const coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      
      // console.log('GPS update:', coordinates)
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
  // console.log('Stopping GPS tracking')
  if ( watchId.value !== null) {
    navigator.geolocation.clearWatch(watchId.value)
    watchId.value = null
  }
}

function toggleInterface() {
  appStore.toggleInterface()
}

// Watch for debug mode changes to reinitialize GPS
watch(() => questStore.isDebugMode, () => {
  stopContinuousTracking()
  initializeGPS()
})

// Function to set up initial hash fragments in the navigation history
function setupHashHistory(): void {
  // Only set up if we don't already have a hash
  if (!window.location.hash) {
    // First, add an initial hash fragment
    window.location.hash = '#game'
    
    // Then, add a second hash fragment to create history
    setTimeout(() => {
      window.location.hash = '#main'
    }, 100)
  }
}

// Function to handle hash changes
function handleHashChange(event: HashChangeEvent): void {
  // Prevent default behavior
  event.preventDefault()
  
  // Check if item modal is open
  if (appStore.inspectedItem) {
    appStore.closeItemInspectModal()
    // Add a new history entry to maintain several fragments
    window.history.pushState(null, '', '#main')
    return
  }
  
  // Check if interface is open
  if (appStore.isInterfaceOpen) {
    appStore.closeInterface()
    // Add a new history entry to maintain several fragments
    window.history.pushState(null, '', '#main')
    return
  }
  
  // If nothing is open, just add a new hash to maintain history depth
  window.history.pushState(null, '', '#main')
}

// Function to handle page unload attempts (reload, close, URL change)
function setupBeforeUnloadHandler(): void {
  beforeUnloadHandler.value = (event: BeforeUnloadEvent) => {
    // Standard way to show confirmation dialog
    event.preventDefault()
    
    // Chrome requires returnValue to be set
    event.returnValue = ''
    
    // Message (note: most modern browsers show their own generic message instead)
    return 'Are you sure you want to leave? Your progress may be lost.'
  }
  
  window.addEventListener('beforeunload', beforeUnloadHandler.value)
}

onMounted(() => {
  // console.log('App mounted, initializing GPS...')
  initializeGPS()
  
  // Set up hash history
  setupHashHistory()
  
  // Add hash change listener
  hashChangeListener.value = (event) => handleHashChange(event)
  window.addEventListener('hashchange', hashChangeListener.value)
  
  // Set up beforeunload handler
  setupBeforeUnloadHandler()
})

onUnmounted(() => {
  // Clean up the continuous tracking when the component is unmounted
  stopContinuousTracking()
  
  // Remove hash change listener
  if (hashChangeListener.value) {
    window.removeEventListener('hashchange', hashChangeListener.value)
  }
  
  // Remove beforeunload handler
  if (beforeUnloadHandler.value) {
    window.removeEventListener('beforeunload', beforeUnloadHandler.value)
  }
})
</script>

<template>
  <div class="app">
    <div v-if="questStore.isDebugMode" class="debug-banner">DEBUG MODE</div>

    <NotificationSystem />
    
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
      <button @click="questStore.toggleDebugMode" class="debug-button">
        Enable Debug Mode
      </button>
    </div>
    <template v-else>
      <!-- Normal game screens -->
      <StartScreen v-if="appStore.screen === 'start_quest'" />
      <IntroScreen v-else-if="appStore.screen === 'intro'" />
      <MapScreen v-else-if="appStore.screen === 'map'" />
      <LocationScreen v-else-if="appStore.screen === 'location'" />
      <VictoryScreen v-else-if="appStore.screen === 'victory'" />

      <!-- Interface ButtonInput (only show during gameplay) -->
      <button 
        v-if="(appStore.screen === 'location' || appStore.screen === 'map')"
        class="interface-button"
        :class="{ 'pulse-animation': showButtonPulse }"
        @click="toggleInterface"
        title="Open Interface"
      >
        🎒
      </button>
      
      <!-- Interface Modal -->
      <InterfaceModal />
      
      <!-- Global ItemModal -->
      <ItemModal v-if="appStore.inspectedItem" />
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
  top: 5px;
  left: 5px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #4a8;
  color: white;
  font-size: 45px;
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

.debug-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #4a8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.debug-button:hover {
  background-color: #3a7;
}
</style>

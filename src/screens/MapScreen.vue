<template>
  <div class="map-container">
    <div id="map" ref="mapContainer"></div>


    <div v-if="questStore.status !== 'no_quest'" class="quest-info">
      <h3>{{ questStore.title }}</h3>
      <button @click="showQuitDialog = true">Quit Quest</button>
    </div>

    <button class="center-button" @click="centerOnPlayer" v-if="playerLocation">
      <span>Center</span>
    </button>

    <div v-if="showQuitDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>Quit Quest?</h3>
        <p>Are you sure you want to quit your current quest?</p>
        <div class="dialog-actions">
          <button @click="quitQuest">Yes, Quit</button>
          <button @click="showQuitDialog = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type {Location, Pub} from '../types'
import {useQuestStore} from "../stores/questStore";
import {usePubStore} from "../stores/pubStore";
import {useAppStore} from "../stores/appStore";
import {locationTypesById} from "@/data/locationTypes.ts";

const questStore = useQuestStore()
const appStore = useAppStore()
const pubStore = usePubStore()
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<L.Map | null>(null)
const playerMarker = ref<L.Marker | null>(null)
const pubMarkers = ref<L.Marker[]>([])
const showQuitDialog = ref<boolean>(false)
const isInitializing = ref<boolean>(false)

// Computed properties
const playerLocation = computed(() => appStore.playerLocation)
const pubs = computed(() => pubStore.pubs)
const mapPosition = computed(() => appStore.mapPosition)
const mapZoom = computed(() => appStore.mapZoom)

function createPubMarker(pub: Pub, mapInstance: L.Map): L.Marker {
  if (!mapInstance) {
    throw new Error('No map instance provided for marker creation')
  }

  const locationType = locationTypesById[pub.locationType]
  const iconPath = `./icons/${locationType.filename}`

  const marker = L.marker([pub.lat, pub.lng], {
    icon: L.icon({
      iconUrl: iconPath,
      iconSize: [67, 83],
      iconAnchor: [34, 83],
      popupAnchor: [0, -16],
      shadowUrl: './icons/shadow.png',
      shadowSize: [161, 100],
      shadowAnchor: [10, 90]
    })
  })
      .addTo(mapInstance)


  marker.on('click', () => {
    appStore.setFocusPub(pub.id)
    appStore.setScreen('location_info')
  })

  return marker
}

function cleanupMap(): void {
  if (map.value) {
    try {
      map.value.off()
      map.value.remove()
    } catch (error) {
      console.error('Error cleaning up map:', error)
    }
    map.value = null
  }
  pubMarkers.value.forEach(marker => {
    try {
      if (marker) marker.remove()
    } catch (error) {
      console.error('Error removing marker:', error)
    }
  })
  pubMarkers.value = []
}

function initializeMap(): void {
  if (isInitializing.value) return
  isInitializing.value = true

  try {
    console.log('Initializing map...')
    cleanupMap()

    // Create map container if it doesn't exist
    if (!document.getElementById('map')) {
      const mapContainer = document.createElement('div')
      mapContainer.id = 'map'
      mapContainer.style.width = '100%'
      mapContainer.style.height = '100%'
      document.querySelector('.map-container')?.appendChild(mapContainer)
    }

    // Use stored map position, fall back to player location or default
    let location: Location
    let zoom: number

    if (mapPosition.value) {
      location = mapPosition.value
      zoom = mapZoom.value || 16
    } else if (playerLocation.value) {
      location = playerLocation.value
      zoom = 16
    } else {
      location = { lat: 51.505, lng: -0.09 }
      zoom = 13
    }
    
    console.log('Using location for map:', location, 'zoom:', zoom)

    const mapInstance = L.map('map', {
      preferCanvas: true,
      zoomControl: false
    }).setView([location.lat, location.lng], zoom)

    // Add event listeners for map movement and zoom
    mapInstance.on('moveend', () => {
      const center = mapInstance.getCenter()
      appStore.setMapPosition({ lat: center.lat, lng: center.lng })
    })

    mapInstance.on('zoomend', () => {
      appStore.setMapZoom(mapInstance.getZoom())
    })

    // Prevent back/forward navigation triggered by horizontal swipes on the map
    const mapElement = document.getElementById('map')
    if (mapElement) {
      mapElement.addEventListener('touchstart', (e) => {
        // Store initial touch position
        (window as any).touchStartX = e.touches[0].clientX
      }, { passive: false })
      
      mapElement.addEventListener('touchmove', (e) => {
        // Calculate horizontal swipe distance
        if ((window as any).touchStartX) {
          const touchEndX = e.touches[0].clientX
          const deltaX = (window as any).touchStartX - touchEndX
          
          // If significant horizontal swipe detected, prevent default to block browser navigation
          if (Math.abs(deltaX) > 30) {
            e.preventDefault()
          }
        }
      }, { passive: false })
    }

    L.tileLayer('https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}{r}.png?apikey=090957d4bae841118cdb982b96895428', {
      attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 22
    }).addTo(mapInstance);

    // Add zoom control after map is initialized
    L.control.zoom({
      position: 'bottomright'
    }).addTo(mapInstance)

    map.value = mapInstance
    console.log('Map initialized successfully with location:', location)


    // Add player marker if location is available
    if (playerLocation.value) {
      updatePlayerMarker(playerLocation.value)
    }

    // Generate pub markers
    generatePubMarkers()


  } catch (error) {
    console.error('Error initializing map:', error)
  } finally {
    isInitializing.value = false
  }
}



function quitQuest(): void {
  questStore.endQuest()
  appStore.setScreen('start_quest')
  showQuitDialog.value = false
}

function initWhenReady(): void {
  if (playerLocation.value) {
    initializeMap()
  } else {
    setTimeout(initWhenReady, 100)
  }
}

onMounted(() => {
  console.log('MapView mounted')

  // Wait for next tick to ensure DOM is ready
  nextTick(() => {
    initWhenReady()
  })
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})

// Watch for location changes
watch(playerLocation, (newLocation) => {
  if (newLocation && map.value) {
    updatePlayerMarker(newLocation)
  }
}, { immediate: true })

// Watch for game mode changes
watch(() => appStore.screen, (newMode) => {
  if (newMode !== 'map' && map.value) {
    cleanupMap()
  }
}, { immediate: true })

function generatePubMarkers(): void {
  if (!map.value) return;
  
  // Clear existing markers
  pubMarkers.value.forEach(marker => marker.remove());
  pubMarkers.value = [];

  // Create new markers
  pubs.value.forEach((pub: Pub) => {
    const marker = createPubMarker(pub, map.value as L.Map)
    pubMarkers.value.push(marker)
    return marker
  })

  console.log('Total markers created:', pubMarkers.value.length)
}
function updatePlayerMarker(location: Location): void {
  const theMap = map.value as L.Map
  if (!theMap) return

  // Remove existing marker
  if (playerMarker.value) {
    playerMarker.value.remove()
  }

  // Create new marker with a clear icon
  playerMarker.value = L.marker([location.lat, location.lng], {
    icon: L.divIcon({
      className: 'player-marker',
      html: '<div class="player-dot"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
  }).addTo(theMap)
}

function centerOnPlayer(): void {
  if (!map.value || !playerLocation.value) return
  
  map.value.setView(
    [playerLocation.value.lat, playerLocation.value.lng],
    16,
    { animate: true }
  )
}
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.quest-info {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  border-radius: 8px;
  color: white;
  max-width: 300px;
}

.pub-info {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.start-pub, .end-pub {
  flex: 1;
}

#map {
  flex: 1;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.player-marker {
  background-color: #4CAF50;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.pub-details {
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 1000;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.dialog {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  text-align: center;
}

.dialog-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.pub-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
}

:deep(.player-marker) {
  font-size: 24px;
  text-align: center;
}

:deep(.player-dot) {
  width: 20px;
  height: 20px;
  background-color: #4285F4;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
}

:deep(.pub-marker) {
  cursor: pointer;
}

.center-button {
  position: absolute;
  bottom: 100px;
  right: 10px;
  padding: 10px 15px;
  border-radius: 20px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  z-index: 1000;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}
</style> 
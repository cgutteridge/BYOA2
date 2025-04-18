<template>
  <div class="map-container">
    <div id="map" ref="mapContainer"></div>
  </div>
</template>

<script setup lang="ts">
import {computed, createApp, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type {Coordinates, GameLocation} from '../types'
import {useLocationStore} from "../stores/locationStore";
import {useAppStore} from "../stores/appStore";
import {locationTypesById} from "@/data/locationTypes.ts";
import LocationPopup from '@/components/LocationPopup.vue'

// Configuration constants
const BOTTOM_OFFSET = 20 // Distance from bottom of screen  when opening a popup in pixels
const EDGE_OFFSET = 300 // Minimum distance from screen edges  when opening a popup in pixels

const appStore = useAppStore()
const locationStore = useLocationStore()
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<L.Map | null>(null)
const playerMarker = ref<L.Marker | null>(null)
const gameLocationMarkers = ref<L.Marker[]>([])
const isInitializing = ref<boolean>(false)
const mountedPopupApps = ref<any[]>([])

// Computed properties
const playerCoordinates = computed(() => appStore.playerCoordinates)
const gameLocations = computed(() => locationStore.locations)
const mapPosition = computed(() => appStore.mapPosition)
const mapZoom = computed(() => appStore.mapZoom)

function createGameLocationMarker(gameLocation: GameLocation, mapInstance: L.Map): L.Marker {
  if (!mapInstance) {
    throw new Error('No map instance provided for marker creation')
  }

  const gameLocationType = locationTypesById[gameLocation.gameLocationType]
  const iconPath = `./icons/${gameLocationType.filename}`

  const marker = L.marker([gameLocation.lat, gameLocation.lng], {
    icon: L.icon({
      iconUrl: iconPath,
      iconSize: [67, 83],
      iconAnchor: [34, 83],
      popupAnchor: [0, -30],
      shadowUrl: './icons/shadow.png',
      shadowSize: [161, 100],
      shadowAnchor: [10, 90]
    })
  }).addTo(mapInstance)

  // Create popup for this gameLocation
  const popup = L.popup({
    className: 'gameLocation-info-popup',
    maxWidth: 500,
    minWidth: 320,
    closeButton: false,
    autoClose: true,
    closeOnEscapeKey: true,
    offset: [0, -25],
    autoPan: false,
    keepInView: false
  })

  marker.on('popupopen', () => {
    // Create the popup content with Vue
    const container = document.createElement('div')
    container.className = 'popup-vue-container'
    
    // Create a new Vue app with our component
    const app = createApp(LocationPopup, {gameLocation})
    
    // Mount the app to our container
    app.mount(container)
    
    // Add to list of mounted apps for cleanup
    mountedPopupApps.value.push(app)

    // First, set the content of the popup
    popup.setContent(container)
    
    // After the Vue component has rendered, update popup position to ensure proper positioning
    setTimeout(() => {
      if (map.value && popup.isOpen()) {
        //popup._updatePosition();
        try {
          // Get map size
          const mapSize = map.value.getSize();

          // We want the marker at position X,Y where:
          // Y is BOTTOM_OFFSET from bottom of screen
          // X follows our rules for horizontal positioning

          
          // Get current popup position in pixels
          const markerPoint = map.value.latLngToContainerPoint(marker.getLatLng());
          
          // Calculate where we want it in pixels
          let targetX = markerPoint.x;
          if (mapSize.x < EDGE_OFFSET * 2) {
            // Center on small screens
            targetX = mapSize.x / 2;
          } else {
            // Enforce minimum distance from edges on larger screens
            if (targetX < EDGE_OFFSET) {
              targetX = EDGE_OFFSET;
            } else if (targetX > mapSize.x - EDGE_OFFSET) {
              targetX = mapSize.x - EDGE_OFFSET;
            }
          }
          
          // The Y position: BOTTOM_OFFSET from bottom
          const targetY = mapSize.y - BOTTOM_OFFSET;
          
          // Calculate how far we need to move in pixels
          const deltaX = targetX - markerPoint.x;
          const deltaY = targetY - markerPoint.y;
          
          // Convert that pixel offset to a change in the map center
          // We need to move the map in the opposite direction
          const newCenter = map.value.containerPointToLatLng([
            mapSize.x/2 - deltaX,
            mapSize.y/2 - deltaY
          ]);
          
          // Pan the map to the new center
          map.value.panTo(newCenter, { animate: true });
        } catch (e) {
          console.error('Error positioning map:', e);
        }
      }
    }, 50);
  })

  marker.on('popupclose', () => {
    console.log('Popup closed')
    // Always clean up apps since we're not reopening popups
    cleanupPopupApps()
  })
  marker.bindPopup(popup)

  return marker
}

function closePopup() {
  // Clean up Vue apps
  cleanupPopupApps()

  try {
    // Try to close popups safely
    map.value?.closePopup()
  } catch (error) {
    console.error('Error closing popup:', error)
  }

  // If there was an active popup, update the map
}

function cleanupMap(): void {
  // First make sure all popups are closed and Vue apps unmounted
  closePopup();
  cleanupPopupApps();
  
  if (map.value) {
    try {
      // Remove markers first
      gameLocationMarkers.value.forEach(marker => {
        try {
          if (marker) marker.remove()
        } catch (error) {
          console.error('Error removing marker:', error)
        }
      })
      gameLocationMarkers.value = []
      
      // Then remove map
      map.value.off()
      map.value.remove()
    } catch (error) {
      console.error('Error cleaning up map:', error)
    }
    map.value = null
  }
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

    // Use stored map position, fall back to player gameLocation or default
    let gameLocation: Coordinates
    let zoom: number

    if (mapPosition.value) {
      gameLocation = mapPosition.value
      zoom = mapZoom.value || 16
    } else if (playerCoordinates.value) {
      gameLocation = playerCoordinates.value
      zoom = 16
    } else {
      gameLocation = { lat: 51.505, lng: -0.09 }
      zoom = 13
    }
    
    console.log('Using gameLocation for map:', gameLocation, 'zoom:', zoom)

    const mapInstance = L.map('map', {
      preferCanvas: true,
      zoomControl: false  // Disable the default zoom control
    }).setView([gameLocation.lat, gameLocation.lng], zoom)

    // Add event listeners for map movement and zoom
    mapInstance.on('moveend', () => {
      const center = mapInstance.getCenter()
      appStore.setMapPosition({ lat: center.lat, lng: center.lng })
      
      // Remove popup reopening logic
    })

    mapInstance.on('zoomend', () => {
      appStore.setMapZoom(mapInstance.getZoom())
      
      // Remove popup reopening logic
    })

    // Simplify to just close any open popup when zoom starts
    mapInstance.on('zoomstart', () => {
      closePopup()
    })

    // Keep click listener to close popup
    mapInstance.on('click', () => {
      closePopup()
    })

    L.tileLayer('https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}{r}.png?apikey=090957d4bae841118cdb982b96895428', {
      attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 22
    }).addTo(mapInstance);

    // Add zoom control after map is initialized
    L.control.zoom({
      position: 'bottomright'
    }).addTo(mapInstance)

    // Add custom center control
    const CenterControl = L.Control.extend({
      options: {
        position: 'bottomright'
      },

      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const link = L.DomUtil.create('a', 'leaflet-control-center', container);
        link.innerHTML = '⊕';
        link.href = '#';
        link.title = 'Center on player';

        L.DomEvent
          .on(link, 'click', L.DomEvent.preventDefault)
          .on(link, 'click', () => centerOnPlayer());

        return container;
      }
    });

    // Add the custom control to the map
    new CenterControl().addTo(mapInstance);

    map.value = mapInstance
    console.log('Map initialized successfully with gameLocation:', gameLocation)


    // Add player marker if gameLocation is available
    if (playerCoordinates.value) {
      updatePlayerMarker(playerCoordinates.value)
    }

    // Generate gameLocation markers
    generateGameLocationMarkers()


  } catch (error) {
    console.error('Error initializing map:', error)
  } finally {
    isInitializing.value = false
  }
}

function initWhenReady(): void {
  if (playerCoordinates.value) {
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
  closePopup();
  cleanupPopupApps();
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})

// Watch for gameLocation changes
watch(playerCoordinates, (newGameLocation) => {
  if (newGameLocation && map.value) {
    updatePlayerMarker(newGameLocation)
  }
}, { immediate: true })

// Watch for game mode changes
// @ts-ignore
watch(() => appStore.screen, (newMode, oldMode) => {
  if (newMode !== 'map' && map.value) {
    closePopup()
    cleanupMap()
  }
}, { immediate: true })

function generateGameLocationMarkers(): void {
  if (!map.value) return;
  
  // Clear existing markers
  gameLocationMarkers.value.forEach(marker => marker.remove());
  gameLocationMarkers.value = [];

  // Create new markers
  gameLocations.value.forEach((gameLocation: GameLocation) => {
    const marker = createGameLocationMarker(gameLocation, map.value as L.Map)
    gameLocationMarkers.value.push(marker)
    return marker
  })

  console.log('Total markers created:', gameLocationMarkers.value.length)
}

function updatePlayerMarker(coords: Coordinates): void {
  const theMap = map.value as L.Map
  if (!theMap) return

  // Remove existing marker
  if (playerMarker.value) {
    playerMarker.value.remove()
  }

  // Create new marker with a clear icon
  playerMarker.value = L.marker([coords.lat, coords.lng], {
    icon: L.divIcon({
      className: 'player-marker',
      html: '<div class="player-dot"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
  }).addTo(theMap)
}

function centerOnPlayer(): void {
  if (!map.value || !playerCoordinates.value) return
  
  map.value.setView(
    [playerCoordinates.value.lat, playerCoordinates.value.lng],
    16,
    { animate: true }
  )
}

// Helper to clean up mounted Vue apps
function cleanupPopupApps() {
  mountedPopupApps.value.forEach(app => {
    try {
      app.unmount()
    } catch (e) {
      console.error('Error unmounting Vue app:', e)
    }
  })
  mountedPopupApps.value = []

  // Also clean up any orphaned popup containers
  try {
    const containers = document.querySelectorAll('.popup-vue-container')
    containers.forEach(container => {
      if (container.parentElement && container.parentElement.classList.contains('leaflet-popup-content')) {
        // Only remove if it's inside a popup
        container.remove()
      }
    })
  } catch (error) {
    console.error('Error cleaning up popup containers:', error)
  }
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

#map {
  flex: 1;
  width: 100%;
  height: 100%;
  z-index: 1;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
}

:deep(.player-dot) {
  width: 20px;
  height: 20px;
  background-color: #4285F4;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
}

:deep(.leaflet-control-center) {
  font-size: 22px;
  font-weight: bold;
}

/* Popup styles */
:deep(.gameLocation-info-popup) {
  max-width: 90vw !important;
}

:deep(.gameLocation-info-popup .leaflet-popup-content-wrapper) {
  background: rgba(30, 30, 30, 0.95);
  border-radius: 12px;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.7);
  padding: 5px;
}

:deep(.gameLocation-info-popup .leaflet-popup-tip) {
  background: rgba(30, 30, 30, 0.95);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.7);
}

:deep(.gameLocation-info-popup .leaflet-popup-content) {
  margin: 0;
  width: auto !important;
  max-height: 75vh;
  overflow-y: auto;
}

:deep(.popup-vue-container) {
  max-width: 100%;
  min-width: 280px;
  display: block;
}

@media screen and (min-width: 601px) {
  :deep(.popup-vue-container) {
    min-width: 320px;
    width: 450px;
  }
}

@media screen and (max-width: 600px) {
  :deep(.gameLocation-info-popup) {
    max-width: 95vw !important;
  }
  
  :deep(.gameLocation-info-popup .leaflet-popup-content) {
    max-height: 70vh;
  }
}
</style> 
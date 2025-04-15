<template>
  <div class="map-container">
    <div id="map" ref="mapContainer"></div>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch, createApp} from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type {Location, Pub} from '../types'
import {usePubStore} from "../stores/pubStore";
import {useAppStore} from "../stores/appStore";
import {locationTypesById} from "@/data/locationTypes.ts";
import {useQuestStore} from "../stores/questStore";
import PubPopup from '@/components/PubPopup.vue'

const appStore = useAppStore()
const pubStore = usePubStore()
const questStore = useQuestStore()
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<L.Map | null>(null)
const playerMarker = ref<L.Marker | null>(null)
const pubMarkers = ref<L.Marker[]>([])
const isInitializing = ref<boolean>(false)
const selectedPub = ref<Pub | null>(null)
const activePopup = ref<L.Popup | null>(null)
const mountedPopupApps = ref<any[]>([])

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
      popupAnchor: [0, -30],
      shadowUrl: './icons/shadow.png',
      shadowSize: [161, 100],
      shadowAnchor: [10, 90]
    })
  }).addTo(mapInstance)

  // Create popup for this pub
  const popup = L.popup({
    className: 'pub-info-popup',
    maxWidth: 500,
    minWidth: 320,
    closeButton: false,
    autoClose: false,
    closeOnEscapeKey: true,
    offset: [0, -25],
    autoPan: true,
    keepInView: true
  })

  marker.on('click', () => {
    // Store selected pub
    selectedPub.value = pub
    appStore.setFocusPub(pub.id)
    
    // Close any existing popup first
    if (map.value) {
      map.value.closePopup()
    }
    
    // Center map on pub with a slight offset to account for popup
    mapInstance.setView([pub.lat, pub.lng - 0.0005], mapInstance.getZoom(), { animate: true })
    
    // Create the popup content with Vue
    const container = document.createElement('div')
    container.className = 'popup-vue-container'
    
    // Create a new Vue app with our component
    const app = createApp(PubPopup, {
      pub,
      onClose: closePopup,
      onScout: handleScout,
      onEnter: handleEnter
    })
    
    // Mount the app to our container
    app.mount(container)
    
    // Add to list of mounted apps for cleanup
    mountedPopupApps.value.push(app)
    
    // Set the popup content
    popup.setContent(container)
    
    // Unbind any existing popup and bind a new one
    marker.unbindPopup()
    marker.bindPopup(popup)
    
    // Open the popup with a slight delay
    setTimeout(() => {
      marker.openPopup()
      activePopup.value = popup
    }, 50)
  })

  return marker
}

function closePopup() {
  if (map.value) {
    // First try to close any open popups using Leaflet's methods
    map.value.closePopup();
    
    // Clean up Vue apps
    cleanupPopupApps();
    
    // As a fallback, also remove popup elements directly
    const activePubs = document.querySelectorAll('.leaflet-popup');
    activePubs.forEach(popup => {
      popup.remove();
    });
    
    activePopup.value = null;
    selectedPub.value = null;
  }
}

function handleScout(pubId: string) {
  // After scouting, refresh markers to update popup content
  nextTick(() => {
    generatePubMarkers()
    if (pubId && map.value) {
      // Find pub in store
      const pub = pubStore.pub(pubId)
      if (pub) {
        // Set as selected pub again and reopen popup
        selectedPub.value = pub
        const markers = pubMarkers.value.filter(marker => {
          const latlng = marker.getLatLng()
          return latlng.lat === pub.lat && latlng.lng === pub.lng
        })
        
        if (markers.length > 0) {
          // Trigger click on marker to reopen popup with fresh content
          markers[0].fire('click')
        }
      }
    }
  })
}

function handleEnter(pubId: string) {
  if (pubId) {
    appStore.setFocusPub(pubId)
    appStore.setScreen('location')
    questStore.setCurrentPub(pubId)
  }
}

function cleanupMap(): void {
  // First make sure all popups are closed and Vue apps unmounted
  closePopup();
  cleanupPopupApps();
  
  if (map.value) {
    try {
      // Remove markers first
      pubMarkers.value.forEach(marker => {
        try {
          if (marker) marker.remove()
        } catch (error) {
          console.error('Error removing marker:', error)
        }
      })
      pubMarkers.value = []
      
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

    // Add click listener to close popup when clicking on map
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
  closePopup();
  cleanupPopupApps();
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
watch(() => appStore.screen, (newMode, oldMode) => {
  if (newMode !== 'map' && map.value) {
    closePopup()
    cleanupMap()
  } else if (newMode === 'map' && oldMode === 'location' && appStore.focusPub) {
    // When returning to the map from a location, regenerate markers and reopen the popup
    nextTick(() => {
      if (!map.value) return
      
      // Ensure map is initialized
      if (isInitializing.value) {
        setTimeout(() => {
          reopenFocusedPubPopup()
        }, 500)
      } else {
        reopenFocusedPubPopup()
      }
    })
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

// Function to reopen the popup for the focused pub
function reopenFocusedPubPopup() {
  if (!map.value || !appStore.focusPub) return
  
  const focusedPub = appStore.focusPub
  const markers = pubMarkers.value.filter(marker => {
    const latlng = marker.getLatLng()
    return latlng.lat === focusedPub.lat && latlng.lng === focusedPub.lng
  })
  
  if (markers.length > 0) {
    markers[0].fire('click')
  }
}

// Helper to clean up mounted Vue apps
function cleanupPopupApps() {
  mountedPopupApps.value.forEach(app => {
    try {
      app.unmount();
    } catch (e) {
      console.error('Error unmounting Vue app:', e);
    }
  });
  mountedPopupApps.value = [];
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
:deep(.pub-info-popup) {
  max-width: 90vw !important;
}

:deep(.pub-info-popup .leaflet-popup-content-wrapper) {
  background: rgba(30, 30, 30, 0.95);
  border-radius: 12px;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.7);
  padding: 5px;
}

:deep(.pub-info-popup .leaflet-popup-tip) {
  background: rgba(30, 30, 30, 0.95);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.7);
}

:deep(.pub-info-popup .leaflet-popup-content) {
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
  :deep(.pub-info-popup) {
    max-width: 95vw !important;
  }
  
  :deep(.pub-info-popup .leaflet-popup-content) {
    max-height: 70vh;
  }
}
</style> 
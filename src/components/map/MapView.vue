<template>
  <div id="map" ref="mapContainer">
    <PlayerMarker v-if="mapInstance"/>
    <LocationMarkers v-if="mapInstance"/>
    <RouteTracker v-if="mapInstance"/>
    <!--<DestinationMarker v-if="mapInstance"/>-->
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, provide, ref, shallowRef, watch} from 'vue'
import L, {ZoomAnimEvent} from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {useAppStore} from '@/stores/appStore'
import {useQuestStore} from '@/stores/questStore'
import mapTiles from '@/data/mapTiles'
import PlayerMarker from './PlayerMarker.vue'
import LocationMarkers from './LocationMarkers.vue'
import RouteTracker from './RouteTracker.vue'
import {Coordinates} from "@/types";

// Stores
const appStore = useAppStore()
const questStore = useQuestStore()

// Map container and instance references
const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = shallowRef<any>(null)
const isInitializing = ref<boolean>(false)
const mountedPopupApps = ref<any[]>([])

// Computed properties from stores
const playerCoordinates = computed(() => appStore.playerCoordinates)
const mapPosition = computed(() => appStore.mapPosition)
const mapZoom = computed(() => appStore.mapZoom)
const currentMapTile = computed(() => {
  // Get the selected map tile or fall back to 'stamenWatercolor' as default
  const tileId = questStore.mapTileId || 'stamenWatercolor'
  return mapTiles[tileId] || mapTiles.stamenWatercolor
})

/**
 * Initialize the map with the appropriate settings
 */
function initializeMap(): void {
  if (isInitializing.value) return
  isInitializing.value = true

  try {
    cleanupMap()

    // Use stored map position, fall back to player location or default
    let coordinates
    let zoom

    if (mapPosition.value) {
      coordinates = mapPosition.value
      zoom = mapZoom.value || 16
    } else if (playerCoordinates.value) {
      coordinates = playerCoordinates.value
      zoom = 16
    } else {
      coordinates = {lat: 51.505, lng: -0.09}
      zoom = 13
    }

    const map = L.map('map', {
      preferCanvas: false, // Use DOM rendering for marker animations
      zoomControl: false,  // Disable the default zoom control
      zoomAnimation: true, // Explicitly enable zoom animation
      inertia: true, // Enable inertia for panning
      inertiaDeceleration: 2000, // Inertia deceleration rate (px/s²)
      closePopupOnClick: true,
      maxZoom: currentMapTile.value.maxZoom || 19,
      minZoom: currentMapTile.value.minZoom || 1,
    }).setView([coordinates.lat, coordinates.lng], zoom)

    // Create a custom pane for destination markers that sits below regular markers
    map.createPane('destinationPane')
    map.getPane('destinationPane')!.style.zIndex = '400'

    // Add event listeners for map movement and zoom
    map.on('moveend', () => {
      const center = map.getCenter()
      appStore.setMapPosition({lat: center.lat, lng: center.lng})
    })

    map.on('zoomend', () => {
      appStore.setMapZoom(map.getZoom())
      // Directly update the mapZoomFine value to trigger watches in components
      appStore.mapZoomFine = map.getZoom()
    })

    // Listen for zoom animation events
    map.on('zoomstart', () => {
      closePopup()
    })

    // Handle map clicks for closing popups
    map.on('click', () => {
      closePopup()
    })

    // Get the current map tile options
    const tile = currentMapTile.value
    const apiKey = tile.provider ? import.meta.env[tile.provider] : ''

    const tileUrl = tile.apiKeyRequired
        ? tile.url.replace('{apikey}', apiKey || '')
        : tile.url

    L.tileLayer(tileUrl, {
      attribution: tile.attribution,
      maxZoom: tile.maxZoom,
      maxNativeZoom: tile.maxNativeZoom,
      minZoom: tile.minZoom
    }).addTo(map)

    // Add custom controls
    addMapControls(map)

    mapInstance.value = map

    // Start route tracking
    appStore.startRouteTracking()

    // Add event handlers for smooth zoom animation
    mapInstance.value.on('zoomanim', (e: ZoomAnimEvent) => {
      // Update mapZoomFine directly during zoom animation
      appStore.mapZoomFine = e.zoom
    })

  } catch (error) {
    console.error('Error initializing map:', error)
  } finally {
    isInitializing.value = false
  }
}

/**
 * Add custom controls to the map
 */
function addMapControls(map: any): void {
  // Add zoom control
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map)

  // Add custom center control
  const CenterControl = L.Control.extend({
    options: {
      position: 'bottomright'
    },

    onAdd: function () {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
      const link = L.DomUtil.create('a', 'leaflet-control-center', container)
      link.innerHTML = '⊕'
      link.href = '#'
      link.title = 'Center on player'

      L.DomEvent
          .on(link, 'click', L.DomEvent.preventDefault)
          .on(link, 'click', () => centerOnPlayer())

      return container
    }
  })

  // Add the custom control to the map
  new CenterControl().addTo(map)
}

/**
 * Center the map on the player's position
 */
function centerOnPlayer(): void {
  if (!mapInstance.value || !playerCoordinates.value) return

  mapInstance.value.setView(
      [playerCoordinates.value.lat, playerCoordinates.value.lng],
      16,
      {animate: true}
  )
}

/**
 * Close any open popups and clean up Vue apps
 */
function closePopup(): void {
  // Clean up Vue apps
  cleanupPopupApps()

  try {
    // Try to close popups safely
    mapInstance.value?.closePopup()
  } catch (error) {
    console.error('Error closing popup:', error)
  }
}

/**
 * Clean up all Vue apps that were mounted for popups
 */
function cleanupPopupApps(): void {
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

/**
 * Clean up the map and all markers
 */
function cleanupMap(): void {
  // First make sure all popups are closed and Vue apps unmounted
  closePopup()
  cleanupPopupApps()

  if (mapInstance.value) {
    try {
      // Stop route tracking
      appStore.stopRouteTracking()

      // Then remove map
      mapInstance.value.off()
      mapInstance.value.remove()
    } catch (error) {
      console.error('Error cleaning up map:', error)
    }
    mapInstance.value = null
  }
}

/**
 * Initialize the map when player coordinates are available
 */
function initWhenReady(): void {
  if (playerCoordinates.value) {
    initializeMap()
  } else {
    setTimeout(initWhenReady, 100)
  }
}

// Return the map instance for external use (like teleport mode)
function getMapInstance(): any {
  return mapInstance.value
}

// Component lifecycle hooks
onMounted(() => {
  // Wait for next tick to ensure DOM is ready
  nextTick(() => {
    initWhenReady()
  })
})

onUnmounted(() => {
  closePopup()
  cleanupPopupApps()

  if (mapInstance.value) {
    mapInstance.value.remove()
    mapInstance.value = null
  }
})

watch(() => appStore.mapPosition, (newPosition) => {
  if (!newPosition || !mapInstance.value) return
  
  const mapCoords = mapInstance.value.getCenter()
  if (mapCoords.lat === newPosition.lat && mapCoords.lng === newPosition.lng) {
    return
  }
  mapInstance.value.setView(newPosition, appStore.mapZoom)
})

// Watch for game mode changes
watch(() => appStore.screen, (newMode) => {
  if (newMode !== 'map' && mapInstance.value) {
    closePopup()
    cleanupMap()
  }
}, {immediate: true})

// Watch for map tile style changes
watch(() => questStore.mapTileId, () => {
  // We need to reinitialize the map when the tile style changes
  if (mapInstance.value) {
    // Store current position and zoom
    const currentPosition = mapPosition.value
    const currentZoom = mapZoom.value

    // Clean up and reinitialize
    cleanupMap()
    setTimeout(() => {
      initializeMap()

      // If we had a map position and zoom level, restore it
      if (currentPosition && mapInstance.value) {
        mapInstance.value.setView([currentPosition.lat, currentPosition.lng], currentZoom || 16)
      }
    }, 100)
  }
}, {immediate: false})

// Provide map instance to child components
provide('mapInstance', mapInstance)
provide('mountedPopupApps', mountedPopupApps)

// Expose methods for parent component
defineExpose({
  getMapInstance,
  centerOnPlayer,
  closePopup
})
</script>

<style scoped>
#map {
  flex: 1;
  width: 100%;
  height: 100%;
  z-index: 1;
}
</style> 

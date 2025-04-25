<template>
  <div class="location-markers-container">
    <!-- This is a functional component with no UI rendering -->
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onBeforeUnmount, ref, computed, Ref } from 'vue'
import L from 'leaflet'
import type { Map as LeafletMap, Marker } from 'leaflet'
import type { GameLocation, GameLocationType } from '@/types'
import { toGameLocationTypeId } from '@/types'
import { useLocationStore } from '@/stores/locationStore'
import { useQuestStore } from '@/stores/questStore'
import { locationTypesById } from '@/data/locationTypes'
import { createApp } from 'vue'
import LocationPopup from '@/components/LocationPopup.vue'

// Get the map instance from the parent
const mapInstance = inject<Ref<any>>('mapInstance')
const mountedPopupApps = inject<Ref<any[]>>('mountedPopupApps')

// Stores
const locationStore = useLocationStore()
const questStore = useQuestStore()

// Markers array
const locationMarkers = ref<Marker[]>([])

// Computed properties
const locations = computed(() => locationStore.locations)

// Configuration constants
const BOTTOM_OFFSET = 20 // Distance from bottom of screen when opening a popup in pixels
const EDGE_OFFSET = 300 // Minimum distance from screen edges when opening a popup in pixels

// Computed properties for popup styling based on theme - keep these for reference when setting the class
const popupBackgroundColor = computed(() => {
  return questStore.theme === 'dark' 
    ? 'rgba(30, 30, 30, 1)'
    : 'rgba(255, 255, 255, 1)'
})

/**
 * Scale a location type by applying scale factor to all size and anchor properties
 */
function scaleLocationType(
  locationType: GameLocationType,
  scaleFactor: number,
  sizeReduction: number = 1.0
): GameLocationType {
  // The global size reduction that applies to all icons
  const globalSizeReduction = 0.36

  // Combined scale factor for all calculations
  const combinedScale = scaleFactor * sizeReduction * globalSizeReduction

  const minSize = 20

  // Initial scaling
  let scaledWidth = Math.floor(locationType.size[0] * combinedScale)
  let scaledHeight = Math.floor(locationType.size[1] * combinedScale)

  // Calculate aspect ratio
  const aspectRatio = locationType.size[0] / locationType.size[1]

  // Enforce minimum size while preserving aspect ratio
  if (scaledWidth < minSize || scaledHeight < minSize) {
    if (aspectRatio >= 1) {
      // Wider than tall
      if (scaledWidth < minSize) {
        scaledWidth = minSize
        scaledHeight = Math.floor(scaledWidth / aspectRatio)
      }
    } else {
      // Taller than wide
      if (scaledHeight < minSize) {
        scaledHeight = minSize
        scaledWidth = Math.floor(scaledHeight * aspectRatio)
      }
    }
  }

  // Create a new object to avoid mutating the original
  const scaled: GameLocationType = { ...locationType }

  // Work out how much we are actually scaling
  const actualScale = scaledWidth / locationType.size[0]

  // Scale sizes based on how we scaled the main marker
  scaled.size = [scaledWidth, scaledHeight]
  scaled.anchor = [locationType.anchor[0] * actualScale, locationType.anchor[1] * actualScale]
  scaled.shadowSize = [locationType.shadowSize[0] * actualScale, locationType.shadowSize[1] * actualScale]
  scaled.shadowAnchor = [locationType.shadowAnchor[0] * actualScale, locationType.shadowAnchor[1] * actualScale]

  return scaled
}

/**
 * Create a marker for a game location
 */
function createGameLocationMarker(location: GameLocation, mapInstance: any): Marker | undefined {
  if (!mapInstance) {
    throw new Error('No map instance provided for marker creation')
  }

  // Get the location type or use tower as fallback if the type doesn't exist
  let locationType = locationTypesById[location.type]

  // If location type doesn't exist, convert the location to tower type
  if (!locationType) {
    console.warn(`Location type '${location.type}' not found. Converting to tower type.`)
    // Change the actual location type to 'tower' instead of just using visual fallback
    location.type = toGameLocationTypeId('tower')
    locationType = locationTypesById[location.type]

    // If tower doesn't exist for some reason, we can't continue
    if (!locationType) {
      console.error(`Cannot create marker: both '${location.type}' and fallback 'tower' types are missing`)
      return
    }
  }

  // Apply size reduction for stash - 50% of the normal size
  const sizeReduction = location.type === 'stash' ? 0.5 : 1.0

  // Get current zoom level to scale the icon size
  const currentZoom = mapInstance.getZoom()
  // Base size for zoom level 16
  const baseZoom = 16
  // Calculate zoom factor
  const zoomFactor = Math.pow(2.0, currentZoom - baseZoom)

  // Scale the location type based on zoom
  const scaledType = scaleLocationType(locationType, zoomFactor, sizeReduction)

  const iconProperties = {
    iconUrl: `./icons/${locationType.filename}`,
    shadowUrl: `./icons/shadows/${locationType.filename}`,
    iconSize: scaledType.size,
    iconAnchor: scaledType.anchor,
    shadowSize: scaledType.shadowSize,
    shadowAnchor: scaledType.shadowAnchor,
    className: `leaflet-marker-icon-scalable location-type-${location.type}`,
    popupAnchor: [0, -30] as [number, number] // Default popup anchor
  }

  const marker = L.marker([location.coordinates.lat, location.coordinates.lng], {
    icon: L.icon(iconProperties),
    zIndexOffset: 0, // Use default z-index
    interactive: true, // Enable interaction with marker
    keyboard: false, // Disable keyboard navigation
    bubblingMouseEvents: false // Prevent event bubbling for better performance
  }).addTo(mapInstance)

  // Store location data directly in marker instance
  // @ts-ignore - adding a custom property to the marker
  marker.locationData = location

  // Create popup for this location
  const popup = L.popup({
    className: 'location-info-popup',
    maxWidth: 500,
    minWidth: 320,
    closeButton: false,
    autoClose: true,
    closeOnClick: true,
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
    const app = createApp(LocationPopup, { location })

    // Mount the app to our container
    app.mount(container)

    // Add to list of mounted apps for cleanup
    if (mountedPopupApps?.value) {
      mountedPopupApps.value.push(app)
    }

    // First, set the content of the popup
    popup.setContent(container)
    
    // Manually apply the theme styles to the popup elements
    setTimeout(() => {
      const popupWrapper = document.querySelector('.location-info-popup .leaflet-popup-content-wrapper') as HTMLElement
      const popupTip = document.querySelector('.location-info-popup .leaflet-popup-tip') as HTMLElement
      
      if (popupWrapper) {
        popupWrapper.style.backgroundColor = popupBackgroundColor.value
      }
      
      if (popupTip) {
        popupTip.style.backgroundColor = popupBackgroundColor.value
      }
    }, 0)

    // After the Vue component has rendered, update popup position to ensure proper positioning
    setTimeout(() => {
      if (mapInstance && popup.isOpen()) {
        try {
          // Get map size
          const mapSize = mapInstance.getSize()

          // We want the marker at position X,Y where:
          // Y is BOTTOM_OFFSET from bottom of screen
          // X follows our rules for horizontal positioning

          // Get current popup position in pixels
          const markerPoint = mapInstance.latLngToContainerPoint(marker.getLatLng())

          // Calculate where we want it in pixels
          let targetX = markerPoint.x
          if (mapSize.x < EDGE_OFFSET * 2) {
            // Center on small screens
            targetX = mapSize.x / 2
          } else {
            // Enforce minimum distance from edges on larger screens
            if (targetX < EDGE_OFFSET) {
              targetX = EDGE_OFFSET
            } else if (targetX > mapSize.x - EDGE_OFFSET) {
              targetX = mapSize.x - EDGE_OFFSET
            }
          }

          // The Y position: BOTTOM_OFFSET from bottom
          const targetY = mapSize.y - BOTTOM_OFFSET

          // Calculate how far we need to move in pixels
          const deltaX = targetX - markerPoint.x
          const deltaY = targetY - markerPoint.y

          // Convert that pixel offset to a change in the map center
          // We need to move the map in the opposite direction
          const newCenter = mapInstance.containerPointToLatLng([
            mapSize.x / 2 - deltaX,
            mapSize.y / 2 - deltaY
          ])

          // Pan the map to the new center
          mapInstance.panTo(newCenter, { animate: true })
        } catch (e) {
          console.error('Error positioning map:', e)
        }
      }
    }, 50)
  })

  marker.bindPopup(popup)
  
  return marker
}



/**
 * Generate all game location markers
 */
function generateGameLocationMarkers(): void {
  if (!mapInstance?.value) return

  // Clear existing markers
  locationMarkers.value.forEach(marker => marker.remove())
  locationMarkers.value = []

  // Create new markers
  locations.value.forEach((location: GameLocation) => {
    // Skip special location types
    if (location.type === 'players') {
      return
    }

    // Skip empty stashes
    if (location.type === 'stash' && location.scouted && location.giftItem === undefined) {
      return
    }

    // Skip empty shops
    if (location.type === 'shop' && location.scouted && location.wares === undefined) {
      return
    }

    const marker = createGameLocationMarker(location, mapInstance.value as LeafletMap)
    if (marker) {
      locationMarkers.value.push(marker)
    }
  })
}

/**
 * Clean up all markers before unmounting
 */
function cleanupMarkers(): void {
  locationMarkers.value.forEach(marker => {
    try {
      if (marker) marker.remove()
    } catch (error) {
      console.error('Error removing marker:', error)
    }
  })
  locationMarkers.value = []
}



// Initialize markers when the component is mounted and map is ready
onMounted(() => {
  const initMarkers = () => {
    if (mapInstance?.value) {
      generateGameLocationMarkers()
    } else {
      setTimeout(initMarkers, 100)
    }
  }

  initMarkers()
})

// Clean up markers before unmounting
onBeforeUnmount(() => {
  cleanupMarkers()
})


</script>

<style scoped>

</style>
<template>
  <div class="location-markers-container">
    <!-- This is a functional component with no UI rendering -->
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onBeforeUnmount, ref, computed, Ref, watch } from 'vue'
import L from 'leaflet'
import type { Map as LeafletMap, Marker } from 'leaflet'
import type { GameLocation, GameLocationType, Coordinates } from '@/types'
import { toGameLocationTypeId } from '@/types'
import { useLocationStore } from '@/stores/locationStore'
import { useQuestStore } from '@/stores/questStore'
import { useAppStore } from '@/stores/appStore'
import { locationTypesById } from '@/data/locationTypes'
import { createApp } from 'vue'
import LocationPopup from '@/components/map/LocationPopup.vue'

// Get the map instance from the parent
const mapInstance = inject<Ref<any>>('mapInstance')
const mountedPopupApps = inject<Ref<any[]>>('mountedPopupApps')

// Stores
const locationStore = useLocationStore()
const questStore = useQuestStore()
const appStore = useAppStore()

// Markers array
const locationMarkers = ref<Marker[]>([])

// Computed properties
const locations = computed(() => locationStore.locations)

// Configuration constants
const BOTTOM_OFFSET = 20 // Distance from bottom of screen when opening a popup in pixels
const EDGE_OFFSET = 300 // Minimum distance from screen edges when opening a popup in pixels

// Computed properties for popup styling based on theme - keep these for reference when setting the class
const popupBackgroundColor = computed(() => {
  return questStore.getBackgroundColor('modal')
})

const popupTextColor = computed(() => {
  return questStore.getTextColor('primary')
})

const popupBorderColor = computed(() => {
  return questStore.getBorderColor('light')
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
  const globalSizeReduction = 0.5

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
 * Generate all game location markers
 */
function generateLocationMarkers(): void {
  // Clean up existing markers
  cleanupMarkers()
  
  // Generate markers for each location
  locationStore.locations.forEach(location => {
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

    const marker = createGameLocationMarker(location, mapInstance?.value as LeafletMap)
    if (marker) {
      locationMarkers.value.push(marker)
    }
  })
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

  // Define the base class for CSS styling
  const markerBaseClass = 'leaflet-marker-icon-scalable'
  const locationTypeClass = `location-type-${location.type}`
  const scoutedClass = location.scouted && !location.viewed ? 'scouted-not-viewed' : ''
  const combinedClasses = `${markerBaseClass} ${locationTypeClass} ${scoutedClass}`.trim()

  // For scouted but not viewed locations, use HTML with blue ring indicator
  if (location.scouted && !location.viewed) {
    const iconSize = scaledType.size[0]
    const iconHeight = scaledType.size[1]
    
    const markerHtml = `
      <div class="location-marker-container">
        <div class="scout-indicator"></div>
        <img 
          src="./icons/${locationType.filename}" 
          class="location-marker-image"
          style="width: ${iconSize}px; height: ${iconHeight}px;"
        />
      </div>
    `
    
    // Create the marker with divIcon
    const icon = L.divIcon({
      html: markerHtml,
      className: combinedClasses,
      iconSize: scaledType.size,
      iconAnchor: scaledType.anchor
    })
    
    // Create marker with no shadow for scouted-not-viewed locations
    const marker = L.marker([location.coordinates.lat, location.coordinates.lng], {
      icon: icon,
      interactive: true,
      keyboard: false,
      bubblingMouseEvents: false
    }).addTo(mapInstance)
    
    // Store location data directly in marker instance
    // @ts-ignore - adding a custom property to the marker
    marker.locationData = location
    
    // Create and bind popup
    addPopupToMarker(marker, location)
    
    return marker
  } else {
    // For regular locations, use standard icon with shadow
    const iconProperties = {
      iconUrl: `./icons/${locationType.filename}`,
      shadowUrl: `./icons/shadows/${locationType.filename}`,
      iconSize: scaledType.size,
      iconAnchor: scaledType.anchor,
      shadowSize: scaledType.shadowSize,
      shadowAnchor: scaledType.shadowAnchor,
      className: combinedClasses,
      popupAnchor: [0, -30] as [number, number]
    }
    
    // Create the marker with standard icon
    const marker = L.marker([location.coordinates.lat, location.coordinates.lng], {
      icon: L.icon(iconProperties),
      interactive: true,
      keyboard: false,
      bubblingMouseEvents: false
    }).addTo(mapInstance)
    
    // Store location data directly in marker instance
    // @ts-ignore - adding a custom property to the marker
    marker.locationData = location
    
    // Create and bind popup
    addPopupToMarker(marker, location)
    
    return marker
  }
}

/**
 * Add popup to a marker
 */
function addPopupToMarker(marker: Marker, location: GameLocation): void {
  // Create popup for this location
  const popup = L.popup({
    className: `location-info-popup location-info-popup--${questStore.theme}`,
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

  // Track if this popup has been opened
  let hasBeenOpened = false

  marker.on('popupopen', () => {
    // Flag that this popup has been opened
    hasBeenOpened = true
    
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
      const popupContent = document.querySelector('.location-info-popup .leaflet-popup-content') as HTMLElement
      
      if (popupWrapper) {
        popupWrapper.style.backgroundColor = popupBackgroundColor.value
        popupWrapper.style.borderColor = popupBorderColor.value
      }
      
      if (popupTip) {
        popupTip.style.backgroundColor = popupBackgroundColor.value
      }
      
      if (popupContent) {
        popupContent.style.color = popupTextColor.value
      }
    }, 0)

    // After the Vue component has rendered, update popup position to ensure proper positioning
    setTimeout(() => {
      if (mapInstance?.value && popup.isOpen()) {
        try {
          // Get map size
          const theMap = mapInstance.value
          const mapSize = theMap.getSize()

          // We want the marker at position X,Y where:
          // Y is BOTTOM_OFFSET from bottom of screen
          // X follows our rules for horizontal positioning

          // Get current popup position in pixels
          const markerPoint = theMap.latLngToContainerPoint(marker.getLatLng())

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
          const newCenter = theMap.containerPointToLatLng([
            mapSize.x / 2 - deltaX,
            mapSize.y / 2 - deltaY
          ])

          // Pan the map to the new center
          theMap.panTo(newCenter, { animate: true })
        } catch (e) {
          console.error('Error positioning map:', e)
        }
      }
    }, 50)
  })

  // Handle popup close event
  marker.on('popupclose', () => {
    // Only mark as viewed if the popup was actually opened and shown to the user
    if (hasBeenOpened && location.scouted && !location.viewed) {
      // Update the location in the store
      locationStore.setViewed(location.id, true)
    }
  })

  marker.bindPopup(popup)
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

// Initialize markers when the component is mounted
onMounted(() => {
  const initMarkers = () => {
    if (mapInstance?.value) {
      generateLocationMarkers()
    } else {
      setTimeout(initMarkers, 100)
    }
  }

  initMarkers()
})

// Watch for zoom level changes to update marker size
watch(() => appStore.mapZoomFine, () => {
  if (!mapInstance?.value) return
  // Simply regenerate all markers when zoom changes
  generateLocationMarkers()
}, { immediate: false })

// Watch for location changes to update markers
watch(() => locations.value, () => {
  if (!mapInstance?.value) return
  // Regenerate all markers when locations change
  generateLocationMarkers()
}, { deep: true })

// Watch for theme changes to update popup styles
watch(() => questStore.theme, () => {
  // Find all open popups and update their class names and styles
  document.querySelectorAll('.location-info-popup').forEach(popup => {
    // Update theme-specific class
    popup.classList.remove('location-info-popup--light', 'location-info-popup--dark')
    popup.classList.add(`location-info-popup--${questStore.theme}`)
    
    // Update styles
    const wrapper = popup.querySelector('.leaflet-popup-content-wrapper') as HTMLElement
    const tip = popup.querySelector('.leaflet-popup-tip') as HTMLElement
    const content = popup.querySelector('.leaflet-popup-content') as HTMLElement
    
    if (wrapper) {
      wrapper.style.backgroundColor = popupBackgroundColor.value
      wrapper.style.borderColor = popupBorderColor.value
    }
    
    if (tip) {
      tip.style.backgroundColor = popupBackgroundColor.value
    }
    
    if (content) {
      content.style.color = popupTextColor.value
    }
  })
})

// Clean up markers before unmounting
onBeforeUnmount(() => {
  cleanupMarkers()
})

</script>

<style scoped>
/* Popup styles */
:deep(.location-info-popup) {
  transition: all 0.3s ease;
}

:deep(.location-info-popup .leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border: 1px solid v-bind(popupBorderColor);
  overflow: hidden;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

:deep(.location-info-popup--dark .leaflet-popup-content-wrapper) {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

:deep(.location-info-popup--light .leaflet-popup-content-wrapper) {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

:deep(.location-info-popup .leaflet-popup-tip) {
  transition: background-color 0.3s ease;
}

:deep(.location-info-popup .leaflet-popup-content) {
  margin: 12px 16px;
  transition: color 0.3s ease;
  color: v-bind(popupTextColor);
}

/* Custom marker styles for all locations */
:deep(.location-marker-icon) {
  background: transparent !important;
  border: none !important;
}

:deep(.location-marker-container) {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.location-shadow-icon) {
  background: transparent !important;
  border: none !important;
}

:deep(.location-marker-shadow) {
  opacity: 0.6;
  filter: blur(2px);
  transition: all 0.15s ease-out;
}

:deep(.location-marker-image) {
  transform-origin: center bottom;
  transition: transform 0.15s ease-out;
  position: relative;
  z-index: 2;
}

:deep(.location-marker-icon:hover .location-marker-image) {
  transform: scale(1.1);
}
</style>

<!-- Global styles for map markers, not scoped -->
<style>
/* Scout indicator styles - using global CSS for better compatibility with dynamically created elements */
.scout-indicator {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 4px solid #4285F4;
  background-color: rgba(66, 133, 244, 0.3);
  border-radius: 50%;
  z-index: 1;
  box-shadow: 0 0 10px rgba(66, 133, 244, 0.8);
  animation: pulse-scout 2s infinite ease-in-out;
  pointer-events: none;
}

@keyframes pulse-scout {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

/* Make sure the leaflet container can handle these animations properly */
.leaflet-marker-icon {
  transform-origin: center bottom;
}

/* Ensure scout indicators stand out */
.scouted-not-viewed {
  filter: brightness(1.1);
}
</style>
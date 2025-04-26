<template>
  <div class="destination-marker-container">
    <!-- This is a functional component with no UI rendering -->
  </div>
</template>

<script setup lang="ts">
import { inject, watch, onMounted, onBeforeUnmount, ref, computed, Ref } from 'vue'
import L from 'leaflet'
import type { Map as LeafletMap, Marker } from 'leaflet'
import type { Coordinates } from '@/types'
import { useAppStore } from '@/stores/appStore'
import { useInventoryStore } from '@/stores/inventoryStore'

// Get the map instance from the parent
const mapInstance = inject<Ref<any>>('mapInstance')

// Stores
const appStore = useAppStore()
const inventoryStore = useInventoryStore()

// Marker reference
const destinationMarker = ref<Marker | null>(null)

// Destination coordinates from app store
const destinationCoordinates = computed(() => appStore.mapPosition)

// Check if player has enough tokens to travel to destination
const hasEnoughTokens = computed(() => {
  return inventoryStore.tokenCount >= 0
})

/**
 * Update or create the destination marker
 */
function updateDestinationMarker(): void {
  if (!mapInstance?.value || !destinationCoordinates.value) return

  const theMap = mapInstance.value

  // Remove existing destination marker
  if (destinationMarker.value) {
    destinationMarker.value.remove()
    destinationMarker.value = null
  }

  // Get current zoom level to scale the circle size
  const currentZoom = theMap.getZoom()
  // Base size for zoom level 16
  const baseSize = 240
  const baseZoom = 16

  // Scale size based on zoom level
  const zoomFactor = Math.pow(2.0, currentZoom - baseZoom)
  const circleSize = Math.max(60, Math.min(300, Math.floor(baseSize * zoomFactor)))

  // Use a vibrant color that stands out, with alpha transparency for the fade
  // Change color to green if player has enough tokens, red otherwise
  const primaryColor = hasEnoughTokens.value ? '#22DD33' : '#FF5500' // Green or bright orange

  // Create SVG with radial gradient for fade effect
  const svgSize = circleSize * 2
  const svg = `
    <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fade" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="${primaryColor}" stop-opacity="1" />
          <stop offset="50%" stop-color="${primaryColor}" stop-opacity="0.5" />
          <stop offset="80%" stop-color="${primaryColor}" stop-opacity="0.2" />
          <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="${svgSize / 2}" cy="${svgSize / 2}" r="${svgSize / 2}" fill="url(#fade)"  />
    </svg>
  `

  // Create the destination marker with the SVG icon, specifying the destinationPane
  destinationMarker.value = L.marker([destinationCoordinates.value.lat, destinationCoordinates.value.lng], {
    icon: L.divIcon({
      className: hasEnoughTokens.value
        ? 'destination-marker accessible'
        : 'destination-marker',
      html: svg,
      iconSize: [svgSize, svgSize],
      iconAnchor: [svgSize / 2, svgSize / 2]
    }),
    pane: 'destinationPane' // Use our custom pane that's below the marker pane
  }).addTo(theMap)
}

/**
 * Clean up destination marker before unmounting
 */
function cleanupDestinationMarker(): void {
  if (destinationMarker.value) {
    destinationMarker.value.remove()
    destinationMarker.value = null
  }
}

// Watch for destination coordinate changes
watch(destinationCoordinates, () => {
  updateDestinationMarker()
}, { deep: true })

// Watch for token count changes to update the destination marker color
watch(() => inventoryStore.tokenCount, () => {
  if (destinationCoordinates.value) {
    updateDestinationMarker()
  }
})

// Watch for map zoom changes to update the marker size
watch(() => mapInstance?.value?.getZoom(), () => {
  if (destinationCoordinates.value) {
    updateDestinationMarker()
  }
}, { immediate: false })

// Watch for fine zoom level changes at the end of zoom animations
watch(() => appStore.mapZoomFine, () => {
  if (!mapInstance?.value || !destinationCoordinates.value || !destinationMarker.value) return
  
  const currentZoom = appStore.mapZoomFine || mapInstance.value.getZoom()
  const baseZoom = 16
  
  // Scale size based on zoom level
  const zoomFactor = Math.pow(2.0, currentZoom - baseZoom)
  const baseSize = 240
  const circleSize = Math.max(60, Math.min(300, Math.floor(baseSize * zoomFactor)))
  
  // Create SVG with radial gradient for fade effect
  const svgSize = circleSize * 2
  const primaryColor = hasEnoughTokens.value ? '#22DD33' : '#FF5500' // Green or bright orange
  
  const svg = `
    <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fade" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="${primaryColor}" stop-opacity="1" />
          <stop offset="50%" stop-color="${primaryColor}" stop-opacity="0.5" />
          <stop offset="80%" stop-color="${primaryColor}" stop-opacity="0.2" />
          <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="${svgSize / 2}" cy="${svgSize / 2}" r="${svgSize / 2}" fill="url(#fade)"  />
    </svg>
  `
  
  // Create updated icon
  const icon = L.divIcon({
    className: hasEnoughTokens.value ? 'destination-marker accessible' : 'destination-marker',
    html: svg,
    iconSize: [svgSize, svgSize],
    iconAnchor: [svgSize / 2, svgSize / 2]
  })
  
  // Update the marker's icon
  destinationMarker.value.setIcon(icon)
}, { immediate: false })

// Initialize destination marker when the component is mounted and map is ready
onMounted(() => {
  const initDestinationMarker = () => {
    if (mapInstance?.value && destinationCoordinates.value) {
      updateDestinationMarker()
    } else {
      setTimeout(initDestinationMarker, 100)
    }
  }
  
  initDestinationMarker()
})

// Clean up destination marker before unmounting
onBeforeUnmount(() => {
  cleanupDestinationMarker()
})

</script>

<style scoped>
/* Destination marker styles */
:deep(.destination-marker) {
  background: transparent;
  border: none;
  pointer-events: none;
  transition: all 0.25s ease-in-out;
}

:deep(.destination-marker svg) {
  filter: drop-shadow(0 0 8px rgba(255, 85, 0, 0.6));
  animation: pulse 3s infinite ease-in-out;
}

:deep(.destination-marker.accessible svg) {
  filter: drop-shadow(0 0 8px rgba(34, 221, 51, 0.6));
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style> 
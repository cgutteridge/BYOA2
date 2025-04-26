<template>
  <div class="player-marker-container">
    <!-- This is a functional component with no UI rendering -->
  </div>
</template>

<script setup lang="ts">
import { inject, watch, onMounted, ref, onBeforeUnmount, computed, Ref } from 'vue'
import L from 'leaflet'
import type { Map as LeafletMap, Marker, Circle, IconOptions } from 'leaflet'
import type { Coordinates, GameLocationType } from '@/types'
import { useAppStore } from '@/stores/appStore'
import { useQuestStore } from '@/stores/questStore'
import { locationTypesById } from '@/data/locationTypes'

// Get the map instance from the parent
const mapInstance = inject<Ref<any>>('mapInstance')

// Stores
const appStore = useAppStore()
const questStore = useQuestStore()

// Player marker and scout circle references
const playerMarker = ref<Marker | null>(null)
const scoutCircle = ref<Circle | null>(null)
const scoutTopLabel = ref<Marker | null>(null)
const scoutBottomLabel = ref<Marker | null>(null)

// Player coordinates from app store
const playerCoordinates = computed(() => appStore.playerCoordinates)

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
 * Update the player marker position and appearance
 */
function updatePlayerMarker(coords: Coordinates): void {
  if (!mapInstance?.value) return

  const theMap = mapInstance.value

  // Remove existing marker
  if (playerMarker.value) {
    playerMarker.value.remove()
  }

  // Remove existing scout circle
  if (scoutCircle.value) {
    scoutCircle.value.remove()
  }

  // Get the players icon from the location types
  const playersType = locationTypesById['players' as keyof typeof locationTypesById]

  // Calculate size based on the current zoom
  const currentZoom = theMap.getZoom()
  const baseZoom = 16
  const zoomFactor = Math.pow(2.0, currentZoom - baseZoom)

  // Scale the player location type
  const scaledType = scaleLocationType(playersType, zoomFactor)

  // Get icon configuration
  const iconProperties: IconOptions = {
    iconUrl: `./icons/${playersType.filename}`,
    shadowUrl: `./icons/shadows/${playersType.filename}`,
    iconSize: scaledType.size,
    iconAnchor: scaledType.anchor,
    popupAnchor: [0, -30],
    shadowSize: scaledType.shadowSize,
    shadowAnchor: scaledType.shadowAnchor,
    className: `leaflet-marker-icon-scalable location-type-player`,
  }

  // Create new marker with the players icon
  playerMarker.value = L.marker([coords.lat, coords.lng], {
    icon: L.icon(iconProperties),
    zIndexOffset: 0,
    riseOnHover: true,
    riseOffset: 250,
    interactive: true,
    keyboard: false,
    bubblingMouseEvents: false
  }).addTo(theMap)

  // Create scout range circle
  scoutCircle.value = L.circle([coords.lat, coords.lng], {
    radius: questStore.scoutRange,
    color: '#4285F4',
    fillColor: '#4285F4',
    fillOpacity: 0,
    weight: 2,
    dashArray: '5, 10'
  }).addTo(theMap)

  // Add the scout range labels
  updateScoutRangeLabels(coords, theMap)
}

/**
 * Update the scout range labels with zoom-dependent sizing
 */
function updateScoutRangeLabels(coords: Coordinates, theMap: LeafletMap): void {
  // Calculate positions for top and bottom labels
  const distanceFromEdge = 5 // 5 meters from the edge (closer to the circle)
  const scoutDistanceWithPadding = questStore.scoutRange + distanceFromEdge

  // Convert distance to latitude degrees (approximate)
  // 1 degree of latitude is approximately 111,111 meters
  const latOffset = scoutDistanceWithPadding / 111111

  // Calculate top and bottom points
  const topPoint = {
    lat: coords.lat + latOffset,
    lng: coords.lng
  }

  const bottomPoint = {
    lat: coords.lat - latOffset,
    lng: coords.lng
  }

  // Use fixed base sizes - CSS will handle the scaling
  const baseFontSize = 18
  const labelWidth = 140
  const labelHeight = 30

  // Remove existing labels (important to prevent label duplication)
  if (scoutTopLabel.value) {
    scoutTopLabel.value.remove()
    scoutTopLabel.value = null
  }

  if (scoutBottomLabel.value) {
    scoutBottomLabel.value.remove()
    scoutBottomLabel.value = null
  }

  // Create top scout range label with base size (will be scaled with CSS)
  scoutTopLabel.value = L.marker([topPoint.lat, topPoint.lng], {
    icon: L.divIcon({
      className: 'scout-range-label leaflet-marker-icon-scalable',
      html: `<div class="scout-range-text" style="font-size: ${baseFontSize}px;">scout range</div>`,
      iconSize: [labelWidth, labelHeight],
      iconAnchor: [labelWidth / 2, labelHeight] // Bottom center of the icon
    })
  }).addTo(theMap)

  // Create bottom scout range label with base size (will be scaled with CSS)
  scoutBottomLabel.value = L.marker([bottomPoint.lat, bottomPoint.lng], {
    icon: L.divIcon({
      className: 'scout-range-label leaflet-marker-icon-scalable',
      html: `<div class="scout-range-text" style="font-size: ${baseFontSize}px;">scout range</div>`,
      iconSize: [labelWidth, labelHeight],
      iconAnchor: [labelWidth / 2, 0] // Top center of the icon
    })
  }).addTo(theMap)
}

/**
 * Clean up all markers before unmounting
 */
function cleanupMarkers(): void {
  if (playerMarker.value) {
    playerMarker.value.remove()
    playerMarker.value = null
  }

  if (scoutCircle.value) {
    scoutCircle.value.remove()
    scoutCircle.value = null
  }

  if (scoutTopLabel.value) {
    scoutTopLabel.value.remove()
    scoutTopLabel.value = null
  }

  if (scoutBottomLabel.value) {
    scoutBottomLabel.value.remove()
    scoutBottomLabel.value = null
  }
}

// Watch for player coordinate changes
watch(playerCoordinates, (newCoordinates) => {
  if (newCoordinates && mapInstance?.value) {
    updatePlayerMarker(newCoordinates)
  }
}, { immediate: true })

// Watch for scout range changes
watch(() => questStore.scoutRange, () => {
  if (playerCoordinates.value && mapInstance?.value) {
    updatePlayerMarker(playerCoordinates.value)
  }
})

// Watch for map zoom changes
watch(() => mapInstance?.value?.getZoom(), () => {
  if (playerCoordinates.value && mapInstance?.value) {
    updatePlayerMarker(playerCoordinates.value)
  }
}, { immediate: false })

// Watch for fine zoom level changes at the end of zoom animations
watch(() => appStore.mapZoomFine, () => {
  if (playerCoordinates.value && mapInstance?.value) {
    updatePlayerMarker(playerCoordinates.value)
  }
}, { immediate: false })

// Initialize the player marker when the component is mounted and map is ready
onMounted(() => {
  const initMarker = () => {
    if (mapInstance?.value && playerCoordinates.value) {
      updatePlayerMarker(playerCoordinates.value)
    } else {
      setTimeout(initMarker, 100)
    }
  }
  
  initMarker()
})

// Clean up markers before unmounting
onBeforeUnmount(() => {
  cleanupMarkers()
})
</script>

<style scoped>
/* Scout range label styles */
:deep(.scout-range-text) {
  color: #4285F4;
  text-align: center;
  white-space: nowrap;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8), -1px -1px 2px rgba(255, 255, 255, 0.8);
  transition: font-size 0.25s ease-in-out;
  will-change: font-size;
}
</style> 
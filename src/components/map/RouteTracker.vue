<template>
  <div class="route-tracker-container">
    <!-- This is a functional component with no UI rendering -->
  </div>
</template>

<script setup lang="ts">
import { inject, watch, onMounted, onBeforeUnmount, ref, computed, Ref } from 'vue'
import L from 'leaflet'
import type { Map as LeafletMap, Polyline } from 'leaflet'
import type { Coordinates } from '@/types'
import { useRouteStore } from '@/stores/routeStore'
import { useAppStore } from '@/stores/appStore'

// Get the map instance from the parent
const mapInstance = inject<Ref<LeafletMap | null>>('mapInstance')

// Stores
const routeStore = useRouteStore()
const appStore = useAppStore()

// Route line reference
const routeLine = ref<Polyline | null>(null)

// Computed properties
const playerCoordinates = computed(() => appStore.playerCoordinates)
const routeCoordinates = computed((): Coordinates[] => {
  if (!playerCoordinates.value) return routeStore.routeCoordinates
  return [...routeStore.routeCoordinates, playerCoordinates.value] as Coordinates[]
})

/**
 * Update the route line on the map
 */
function updateRouteLine(): void {
  if (!mapInstance?.value) return

  // Remove existing route line
  if (routeLine.value) {
    routeLine.value.remove()
    routeLine.value = null
  }

  // If there are route coordinates, draw the line
  if (routeCoordinates.value.length > 1) {
    // Convert coordinates to LatLng array
    const latLngs = routeCoordinates.value.map(coord => L.latLng(coord.lat, coord.lng))

    // Create the polyline with dotted red style
    routeLine.value = L.polyline(latLngs, {
      color: '#ff0000',
      weight: 3,
      opacity: 0.7,
      dashArray: '10, 10',
      lineCap: 'round',
      lineJoin: 'round'
    })

    // Add the polyline to the map
    routeLine.value.addTo(mapInstance.value)
  }
}

/**
 * Clean up route line before unmounting
 */
function cleanupRouteLine(): void {
  if (routeLine.value) {
    routeLine.value.remove()
    routeLine.value = null
  }
}

// Watch for route changes
watch(routeCoordinates, () => {
  updateRouteLine()
}, { deep: true })

// Watch for player coordinate changes
watch(playerCoordinates, () => {
  updateRouteLine()
})

// Initialize route line when the component is mounted and map is ready
onMounted(() => {
  const initRouteLine = () => {
    if (mapInstance?.value) {
      updateRouteLine()
    } else {
      setTimeout(initRouteLine, 100)
    }
  }
  
  initRouteLine()
})

// Clean up route line before unmounting
onBeforeUnmount(() => {
  cleanupRouteLine()
})


</script>

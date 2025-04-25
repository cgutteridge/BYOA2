<template>
  <div class="map-container">
    <MapView ref="mapViewRef" />
    <div v-if="questStore.isDebugMode" class="debug-teleport" @click="toggleTeleportMode"
         :class="{ active: teleportModeActive }">
      <div class="debug-teleport-icon">📍</div>
      <div v-if="teleportModeActive" class="debug-teleport-tooltip">Click on map to teleport</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
import { useQuestStore } from '@/stores/questStore'
import { useAppStore } from '@/stores/appStore'
import MapView from '@/components/map/MapView.vue'
import type { LeafletMouseEvent } from 'leaflet'

const questStore = useQuestStore()
const appStore = useAppStore()

// Create a ref for the map view component to access its methods
const mapViewRef = ref<InstanceType<typeof MapView> | null>(null)

// Debug teleport mode state
const teleportModeActive = ref<boolean>(false)
const teleportClickHandler = ref<((e: LeafletMouseEvent) => void) | null>(null)

// Function to toggle teleport mode for debug
function toggleTeleportMode(): void {
  if (!questStore.isDebugMode) return

  teleportModeActive.value = !teleportModeActive.value

  const mapInstance = mapViewRef.value?.getMapInstance()

  // Remove existing click handler if it exists
  if (teleportClickHandler.value && mapInstance) {
    mapInstance.off('click', teleportClickHandler.value)
    teleportClickHandler.value = null
  }

  // If teleport mode is active, add new click handler
  if (teleportModeActive.value && mapInstance) {
    teleportClickHandler.value = (e: LeafletMouseEvent) => {
      const newCoords = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      }

      // Update player coordinates in appStore
      appStore.setPlayerCoordinates(newCoords)

      // Disable teleport mode after use
      teleportModeActive.value = false

      // Remove this click handler
      if (mapInstance && teleportClickHandler.value) {
        mapInstance.off('click', teleportClickHandler.value)
        teleportClickHandler.value = null
      }
    }

    // Add the new click handler
    mapInstance.on('click', teleportClickHandler.value)
  }
}

// Provide the map instance to child components
provide('teleportModeActive', teleportModeActive)
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.debug-teleport {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: background-color 0.2s ease;
}

.debug-teleport.active {
  background-color: rgba(255, 0, 0, 0.9);
}

.debug-teleport-icon {
  font-size: 20px;
  color: white;
}

.debug-teleport-tooltip {
  position: absolute;
  top: 46px;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
}
</style> 
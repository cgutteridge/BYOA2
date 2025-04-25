<template>
  <div class="map-container">
    <div id="map" ref="mapContainer"></div>
    <div v-if="questStore.isDebugMode" class="debug-teleport" @click="toggleTeleportMode"
         :class="{ active: teleportModeActive }">
      <div class="debug-teleport-icon">📍</div>
      <div v-if="teleportModeActive" class="debug-teleport-tooltip">Click on map to teleport</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, createApp, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import L, {IconOptions} from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type {Coordinates, GameLocation} from '@/types'
import {useLocationStore} from "@/stores/locationStore"
import {useAppStore} from "@/stores/appStore"
import {useQuestStore} from "@/stores/questStore"
import {useRouteStore} from "@/stores/routeStore"
import {useInventoryStore} from "@/stores/inventoryStore"
import {locationTypesById} from "@/data/locationTypes"
import LocationPopup from '@/components/LocationPopup.vue'
import calculateDistance from "@/utils/calculateDistance"
import mapTiles from '@/data/mapTiles'
import {toGameLocationTypeId} from '@/types'

// Configuration constants
const BOTTOM_OFFSET = 20 // Distance from bottom of screen  when opening a popup in pixels
const EDGE_OFFSET = 300 // Minimum distance from screen edges  when opening a popup in pixels

const appStore = useAppStore()
const locationStore = useLocationStore()
const questStore = useQuestStore()
const routeStore = useRouteStore()
const inventoryStore = useInventoryStore()
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<L.Map | null>(null)
const playerMarker = ref<L.Marker | null>(null)
const scoutCircle = ref<L.Circle | null>(null)
const scoutTopLabel = ref<L.Marker | null>(null)
const scoutBottomLabel = ref<L.Marker | null>(null)
const locationMarkers = ref<L.Marker[]>([])
const routeLine = ref<L.Polyline | null>(null)
const destinationMarker = ref<L.Marker | null>(null)
const isInitializing = ref<boolean>(false)
const mountedPopupApps = ref<any[]>([])
const teleportModeActive = ref<boolean>(false)
const teleportClickHandler = ref<((e: L.LeafletMouseEvent) => void) | null>(null)

// Add a variable to track zoom animation state
const isZooming = ref<boolean>(false)
const zoomStartLevel = ref<number>(16)
const zoomTargetLevel = ref<number>(16)
const zoomProgress = ref<number>(0)

// Computed properties
const playerCoordinates = computed(() => appStore.playerCoordinates)
const locations = computed(() => locationStore.locations)
const mapPosition = computed(() => appStore.mapPosition)
const mapZoom = computed(() => appStore.mapZoom)
const routeCoordinates = computed((): Coordinates[] => [...routeStore.routeCoordinates, playerCoordinates.value] as Coordinates[])
const destinationCoordinates = computed((): Coordinates | null => {
  // Use the endGameLocation from questStore as the destination
  return questStore.endGameLocation?.coordinates || null;
})
const currentMapTile = computed(() => {
  // Get the selected map tile or fall back to 'stamenWatercolor' as default
  const tileId = questStore.mapTileId || 'stamenWatercolor'
  return mapTiles[tileId] || mapTiles.stamenWatercolor
})

function createGameLocationMarker(location: GameLocation, mapInstance: L.Map): L.Marker | undefined {
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
  
  // Apply size reduction for stash - 50% of the normal size regardless of scale setting
  const sizeReduction = location.type === 'stash' ? 0.5 : 1.0
  
  // Apply an overall size reduction of 36% (0.6 * 0.6) to all icons
  const globalSizeReduction = 0.36
  
  const iconProperties: IconOptions = {
    iconUrl: '', // Default value, will be overridden below
    shadowUrl: '', // Default value, will be overridden below
    iconSize: [67, 83],
    iconAnchor: [34, 83],
    popupAnchor: [0, -30],
    shadowSize: [161, 100],
    shadowAnchor: [10, 90],
  }
  
  // Get current zoom level to scale the icon size
  const currentZoom = mapInstance.getZoom()
  // Base size for zoom level 16
  const baseZoom = 16
  
  // Use new scaled icons if the location type has scale=true
  if (locationType.scale) {
    iconProperties.iconUrl = `./icons/${locationType.filename}`
    iconProperties.shadowUrl = `./icons/shadows/${locationType.filename}`
    
    // Calculate zoom factor - scale smoothly with zoom
    const zoomFactor = Math.pow(2.0, currentZoom - baseZoom)
    
    // Use the size from the location type and apply zoom scaling
    if (locationType.size) {
      // Calculate initial scaled dimensions with size reduction
      let scaledWidth = Math.floor(locationType.size[0] * zoomFactor * sizeReduction * globalSizeReduction)
      let scaledHeight = Math.floor(locationType.size[1] * zoomFactor * sizeReduction * globalSizeReduction)
      
      // Enforce minimum size while preserving aspect ratio
      const minSize = 20
      const originalAspectRatio = locationType.size[0] / locationType.size[1]
      
      if (scaledWidth < minSize || scaledHeight < minSize) {
        if (originalAspectRatio >= 1) {
          // Wider than tall
          if (scaledWidth < minSize) {
            scaledWidth = minSize
            scaledHeight = Math.max(minSize / 2, Math.floor(scaledWidth / originalAspectRatio))
          }
        } else {
          // Taller than wide
          if (scaledHeight < minSize) {
            scaledHeight = minSize
            scaledWidth = Math.max(minSize / 2, Math.floor(scaledHeight * originalAspectRatio))
          }
        }
      }
      
      iconProperties.iconSize = [scaledWidth, scaledHeight]
      
      // Set popupAnchor based on the icon height
      // Position the popup above the icon with a small gap
      iconProperties.popupAnchor = [0, -Math.round(scaledHeight * 0.2)]
    }
    
    // Use the anchor from the location type, scaled with zoom
    if (locationType.anchor) {
      const scaledAnchorX = Math.max(10, Math.floor(locationType.anchor[0] * zoomFactor * sizeReduction * globalSizeReduction))
      const scaledAnchorY = Math.max(10, Math.floor(locationType.anchor[1] * zoomFactor * sizeReduction * globalSizeReduction))
      
      iconProperties.iconAnchor = [scaledAnchorX, scaledAnchorY]
    }
    
    // Use the shadowAnchor from the location type, scaled with zoom
    if (locationType.shadowAnchor) {
      const scaledShadowAnchorX = Math.max(10, Math.floor(locationType.shadowAnchor[0] * zoomFactor * sizeReduction * globalSizeReduction))
      const scaledShadowAnchorY = Math.max(10, Math.floor(locationType.shadowAnchor[1] * zoomFactor * sizeReduction * globalSizeReduction))
      
      iconProperties.shadowAnchor = [scaledShadowAnchorX, scaledShadowAnchorY]
    }
    
    // Use the shadowSize from the location type, scaled with zoom
    if (locationType.shadowSize) {
      // Calculate initial scaled dimensions with size reduction
      let scaledShadowWidth = Math.floor(locationType.shadowSize[0] * zoomFactor * sizeReduction * globalSizeReduction)
      let scaledShadowHeight = Math.floor(locationType.shadowSize[1] * zoomFactor * sizeReduction * globalSizeReduction)
      
      // Enforce minimum size while preserving aspect ratio
      const minSize = 20
      const shadowAspectRatio = locationType.shadowSize[0] / locationType.shadowSize[1]
      
      if (scaledShadowWidth < minSize || scaledShadowHeight < minSize) {
        if (shadowAspectRatio >= 1) {
          // Wider than tall
          if (scaledShadowWidth < minSize) {
            scaledShadowWidth = minSize
            scaledShadowHeight = Math.max(minSize / 2, Math.floor(scaledShadowWidth / shadowAspectRatio))
          }
        } else {
          // Taller than wide
          if (scaledShadowHeight < minSize) {
            scaledShadowHeight = minSize
            scaledShadowWidth = Math.max(minSize / 2, Math.floor(scaledShadowHeight * shadowAspectRatio))
          }
        }
      }
      
      iconProperties.shadowSize = [scaledShadowWidth, scaledShadowHeight]
    }
    // If no shadowSize is defined but we have size, calculate it (fallback)
    else if (locationType.size) {
      // The shadow is approximately 20-25% wider than the original due to skew
      const shadowWidth = Math.round(locationType.size[0] * 1.25 * zoomFactor * sizeReduction * globalSizeReduction)
      let shadowHeight = Math.round(locationType.size[1] * zoomFactor * sizeReduction * globalSizeReduction)
      
      // Enforce minimum size while preserving aspect ratio
      const minSize = 20
      const shadowAspectRatio = shadowWidth / shadowHeight
      
      let finalShadowWidth = shadowWidth
      let finalShadowHeight = shadowHeight
      
      if (finalShadowWidth < minSize || finalShadowHeight < minSize) {
        if (shadowAspectRatio >= 1) {
          // Wider than tall
          if (finalShadowWidth < minSize) {
            finalShadowWidth = minSize
            finalShadowHeight = Math.max(minSize / 2, Math.floor(finalShadowWidth / shadowAspectRatio))
          }
        } else {
          // Taller than wide
          if (finalShadowHeight < minSize) {
            finalShadowHeight = minSize
            finalShadowWidth = Math.max(minSize / 2, Math.floor(finalShadowHeight * shadowAspectRatio))
          }
        }
      }
      
      iconProperties.shadowSize = [finalShadowWidth, finalShadowHeight]
    }
  } else {
    // Use standard icons
    iconProperties.iconUrl = `./icons/${locationType.filename}`
    iconProperties.shadowUrl = './icons/shadow.png'
    
    // Special cases for non-scaled icons
    if (location.type === 'stash') {
      // Make stash 50% smaller (already applied through sizeReduction)
      const baseWidth = 33;
      const baseHeight = 41;
      
      iconProperties.iconSize = [Math.round(baseWidth * sizeReduction * globalSizeReduction), Math.round(baseHeight * sizeReduction * globalSizeReduction)]
      iconProperties.iconAnchor = [Math.round(17 * sizeReduction * globalSizeReduction), Math.round(41 * sizeReduction * globalSizeReduction)]
      iconProperties.popupAnchor = [0, -Math.round(15 * sizeReduction * globalSizeReduction)]
      iconProperties.shadowSize = [Math.round(80 * sizeReduction * globalSizeReduction), Math.round(50 * sizeReduction * globalSizeReduction)]
      iconProperties.shadowAnchor = [Math.round(5 * sizeReduction * globalSizeReduction), Math.round(45 * sizeReduction * globalSizeReduction)]
    }
    else if (location.type === 'shop') {
      iconProperties.iconSize = [Math.round(50 * globalSizeReduction), Math.round(61 * globalSizeReduction)]
      iconProperties.iconAnchor = [Math.round(25 * globalSizeReduction), Math.round(61 * globalSizeReduction)]
      iconProperties.popupAnchor = [0, -Math.round(22 * globalSizeReduction)]
      iconProperties.shadowSize = [Math.round(120 * globalSizeReduction), Math.round(75 * globalSizeReduction)]
      iconProperties.shadowAnchor = [Math.round(8 * globalSizeReduction), Math.round(67 * globalSizeReduction)]
    }
  }

  const marker = L.marker([location.coordinates.lat, location.coordinates.lng], {
    icon: L.icon(iconProperties),
  }).addTo(mapInstance)
  
  // Store location data directly in marker instance using Leaflet's internal properties
  // This allows us to retrieve it later during zoom animations
  // @ts-ignore - we're adding a custom property to the marker
  marker.locationData = location

  // Create popup for this location
  const popup = L.popup({
    className: 'location-info-popup',
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
    const app = createApp(LocationPopup, {location})

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
            mapSize.x / 2 - deltaX,
            mapSize.y / 2 - deltaY
          ]);

          // Pan the map to the new center
          map.value.panTo(newCenter, {animate: true});
        } catch (e) {
          console.error('Error positioning map:', e);
        }
      }
    }, 50);
  })

  marker.on('popupclose', () => {
    // Always clean up apps since we're not reopening popups
    cleanupPopupApps()
  })
  marker.bindPopup(popup)

  return marker
}

function closePopup() {
  // Clean up Vue apps. might get called twice but that's OK.
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

  // Clean up teleport handler
  if (map.value && teleportClickHandler.value) {
    map.value.off('click', teleportClickHandler.value)
    teleportClickHandler.value = null
  }

  if (map.value) {
    try {
      // Remove markers first
      locationMarkers.value.forEach(marker => {
        try {
          if (marker) marker.remove()
        } catch (error) {
          console.error('Error removing marker:', error)
        }
      })
      locationMarkers.value = []

      // Remove route line
      if (routeLine.value) {
        routeLine.value.remove()
        routeLine.value = null
      }

      // Remove destination marker
      if (destinationMarker.value) {
        destinationMarker.value.remove()
        destinationMarker.value = null
      }

      // Stop route tracking
      appStore.stopRouteTracking()

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
    let coordinates: Coordinates
    let zoom: number

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

    const mapInstance = L.map('map', {
      preferCanvas: true,
      zoomControl: false,  // Disable the default zoom control
      zoomAnimation: true, // Explicitly enable zoom animation
      markerZoomAnimation: true, // Enable marker zoom animation
      fadeAnimation: true, // Enable fade animation
      maxZoom: 22,
      minZoom: currentMapTile.value.minZoom || 1
    }).setView([coordinates.lat, coordinates.lng], constrainZoom(zoom))
    
    // Create a custom pane for destination markers that sits below regular markers
    mapInstance.createPane('destinationPane');
    mapInstance.getPane('destinationPane')!.style.zIndex = '400';
    
    // Add event listeners for map movement and zoom
    mapInstance.on('moveend', () => {
      const center = mapInstance.getCenter()
      appStore.setMapPosition({lat: center.lat, lng: center.lng})
    })

    // Listen for zoom animation events
    mapInstance.on('zoomstart', () => {
      closePopup()
      zoomStartLevel.value = mapInstance.getZoom()
      isZooming.value = true
      zoomProgress.value = 0
      
      // Make sure we don't exceed the zoom limits
      const maxZoom = currentMapTile.value.maxZoom || 19
      const minZoom = currentMapTile.value.minZoom || 1
      
      if (zoomStartLevel.value > maxZoom) {
        mapInstance.setZoom(maxZoom)
      } else if (zoomStartLevel.value < minZoom) {
        mapInstance.setZoom(minZoom)
      }
    })
    
    mapInstance.on('zoomanim', (e) => {
      // Get the target zoom level and calculate progress
      zoomTargetLevel.value = e.zoom
      
      // Calculate interpolation factor between 0 and 1
      const totalZoomChange = zoomTargetLevel.value - zoomStartLevel.value
      if (totalZoomChange !== 0) {
        // e.zoom is the current interpolated zoom level
        zoomProgress.value = (e.zoom - zoomStartLevel.value) / totalZoomChange
      }
      
      // Update markers with the current zoom transition
      if (playerCoordinates.value) {
        updatePlayerMarkerDuringZoom(zoomStartLevel.value, zoomTargetLevel.value, zoomProgress.value)
      }
      
      // Update all location markers during zoom transition
      updateMarkersForZoomAnimation(zoomStartLevel.value, zoomTargetLevel.value, zoomProgress.value)
    })

    mapInstance.on('zoomend', () => {
      // Store the current zoom level, but ensure it's within the allowed range
      const currentZoom = mapInstance.getZoom()
      const constrainedZoom = constrainZoom(currentZoom)
      
      // If the zoom level was constrained, set it on the map
      if (currentZoom !== constrainedZoom) {
        mapInstance.setZoom(constrainedZoom)
      }
      
      appStore.setMapZoom(constrainedZoom)
      isZooming.value = false

      // Update scout range labels when zoom changes
      if (playerCoordinates.value && scoutCircle.value) {
        updateScoutRangeLabels(playerCoordinates.value, mapInstance)
      }
      
      // Update player marker to adjust for new zoom level
      if (playerCoordinates.value) {
        updatePlayerMarker(playerCoordinates.value)
      }
      
      // Regenerate location markers to apply correct scaling for the new zoom level
      generateGameLocationMarkers()
    })

    // Handle map clicks for closing popups (and teleporting in debug mode)
    mapInstance.on('click', () => {
      // If teleport mode is active, this will be handled by the teleport click handler
      if (!teleportModeActive.value) {
        closePopup()
      }
    })

    // Get the current map tile options
    const tile = currentMapTile.value
    const apiKey = tile.provider ? import.meta.env[tile.provider] : '';
    
    // Debug log for API key (will be removed in production)
    console.log(`Using map tile provider: ${tile.provider || 'none'}, API Key available: ${apiKey ? 'Yes' : 'No'}`)
    
    const tileUrl = tile.apiKeyRequired 
      ? tile.url.replace('{apikey}', apiKey || '') 
      : tile.url
    
    L.tileLayer(tileUrl, {
      attribution: tile.attribution,
      maxZoom: tile.maxZoom,
      maxNativeZoom: tile.maxNativeZoom,
      minZoom: tile.minZoom
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

      onAdd: function () {
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

    // Add player marker if location is available
    if (playerCoordinates.value) {
      updatePlayerMarker(playerCoordinates.value)
    }

    // Create destination marker first if coordinates exist
    if (destinationCoordinates.value) {
      updateDestinationMarker()
    }

    // Draw the route line if coordinates exist
    updateRouteLine()

    // Generate location markers (last, so they appear on top)
    generateGameLocationMarkers()

    // Start route tracking
    appStore.startRouteTracking()

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
  // Wait for next tick to ensure DOM is ready
  nextTick(() => {
    initWhenReady()
  })
})

onUnmounted(() => {
  closePopup();
  cleanupPopupApps();

  // Clean up teleport handler
  if (map.value && teleportClickHandler.value) {
    map.value.off('click', teleportClickHandler.value)
    teleportClickHandler.value = null
  }

  if (map.value) {
    map.value.remove()
    map.value = null
  }
})

// Watch for location changes
watch(playerCoordinates, (newCoordinates, oldCoordinates) => {
  if (newCoordinates && map.value) {
    updatePlayerMarker(newCoordinates)

    // If we have previous coordinates, calculate distance and possibly add to route
    if (oldCoordinates && routeCoordinates.value.length > 0) {
      const distance = calculateDistance(oldCoordinates, newCoordinates)

      // If distance is significant (more than 25 meters), add to route
      if (distance > 25) {
        routeStore.addRoutePoint(newCoordinates)
      }
    }
  }
}, {immediate: true})

// Watch for game mode changes
// @ts-ignore
watch(() => appStore.screen, (newMode, _oldMode) => {
  if (newMode !== 'map' && map.value) {
    closePopup()
    cleanupMap()
  }
}, {immediate: true})

// Watch for map tile style changes
watch(() => questStore.mapTileId, () => {
  // We need to reinitialize the map when the tile style changes
  if (map.value) {
    // Store current position and zoom
    const currentPosition = mapPosition.value
    const currentZoom = mapZoom.value
    
    // Clean up and reinitialize
    cleanupMap()
    setTimeout(() => {
      initializeMap()
      
      // If we had a map position and zoom level, restore it
      if (currentPosition && map.value) {
        // Make sure zoom is within the allowed range for this tile set
        const constrainedZoom = constrainZoom(currentZoom || 16)
        map.value.setView([currentPosition.lat, currentPosition.lng], constrainedZoom)
      }
    }, 100)
  }
}, { immediate: false })

function generateGameLocationMarkers(): void {
  if (!map.value) return;

  // Clear existing markers
  locationMarkers.value.forEach(marker => marker.remove());
  locationMarkers.value = [];

  // Create new markers
  locations.value.forEach((location: GameLocation) => {
    // Skip special location types
    if (location.type === 'players') {
      return;
    }
    
    // Skip empty stashes
    if (location.type === 'stash' && location.scouted && location.giftItem === undefined) {
      return;
    }
    
    // Skip empty shops
    if (location.type === 'shop' && location.scouted && location.wares === undefined) {
      return;
    }
    
    const marker = createGameLocationMarker(location, map.value as L.Map)
    if (marker) {
      locationMarkers.value.push(marker)
    }
    return marker
  })
}

function updatePlayerMarker(coords: Coordinates): void {
  const theMap = map.value as L.Map
  if (!theMap) return

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
  
  if (playersType) {
    // Calculate size based on the current zoom
    const currentZoom = theMap.getZoom()
    const baseZoom = 16
    const zoomFactor = Math.pow(2.0, currentZoom - baseZoom)
    const globalSizeReduction = 0.36  // Same as location icons
    
    // Get icon configuration
    const iconProperties: IconOptions = {
      iconUrl: `./icons/${playersType.filename}`,
      shadowUrl: `./icons/shadows/${playersType.filename}`,
      iconSize: [67, 83],
      iconAnchor: [34, 83],
      popupAnchor: [0, -30],
      shadowSize: [161, 100],
      shadowAnchor: [10, 90],
    }
    
    // Set scaled dimensions if available
    if (playersType.scale && playersType.size) {
      // Calculate initial scaled dimensions with size reduction
      let scaledWidth = Math.floor(playersType.size[0] * zoomFactor * globalSizeReduction)
      let scaledHeight = Math.floor(playersType.size[1] * zoomFactor * globalSizeReduction)
      
      // Enforce minimum size while preserving aspect ratio
      const minSize = 20
      const originalAspectRatio = playersType.size[0] / playersType.size[1]
      
      if (scaledWidth < minSize || scaledHeight < minSize) {
        if (originalAspectRatio >= 1) {
          // Wider than tall
          if (scaledWidth < minSize) {
            scaledWidth = minSize
            scaledHeight = Math.max(minSize / 2, Math.floor(scaledWidth / originalAspectRatio))
          }
        } else {
          // Taller than wide
          if (scaledHeight < minSize) {
            scaledHeight = minSize
            scaledWidth = Math.max(minSize / 2, Math.floor(scaledHeight * originalAspectRatio))
          }
        }
      }
      
      iconProperties.iconSize = [scaledWidth, scaledHeight]
    }
    
    // Set anchor if available
    if (playersType.anchor) {
      iconProperties.iconAnchor = playersType.anchor.map(val => 
        Math.floor(val * zoomFactor * globalSizeReduction)) as [number, number]
    }
    
    // Set shadow size if available
    if (playersType.shadowSize) {
      iconProperties.shadowSize = playersType.shadowSize.map(val => 
        Math.floor(val * zoomFactor * globalSizeReduction)) as [number, number]
    }
    
    // Set shadow anchor if available
    if (playersType.shadowAnchor) {
      iconProperties.shadowAnchor = playersType.shadowAnchor.map(val => 
        Math.floor(val * zoomFactor * globalSizeReduction)) as [number, number]
    }
    
    // Create new marker with the players icon
    playerMarker.value = L.marker([coords.lat, coords.lng], {
      icon: L.icon(iconProperties),
      zIndexOffset: 0 // Use default z-index to match other markers
    }).addTo(theMap)
  } else {
    // Fallback to the original dot if players icon not found
    playerMarker.value = L.marker([coords.lat, coords.lng], {
      icon: L.divIcon({
        className: 'player-marker',
        html: '<div class="player-dot"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      }),
      zIndexOffset: 0 // Use default z-index to match other markers
    }).addTo(theMap)
  }

  // Create scout range circle
  scoutCircle.value = L.circle([coords.lat, coords.lng], {
    radius: questStore.scoutRange,
    color: '#4285F4',
    fillColor: '#4285F4',
    fillOpacity: 0,
    weight: 2,
    dashArray: '5, 10'
  }).addTo(theMap)

  // Add the scout range labels - this function will handle cleaning up old labels
  updateScoutRangeLabels(coords, theMap);

  // Update the route line to ensure it's properly connected to the player's position
  updateRouteLine();
}

// Function to update scout range labels with zoom-dependent sizing
function updateScoutRangeLabels(coords: Coordinates, theMap: L.Map): void {
  // Calculate positions for top and bottom labels
  // Using the haversine formula approximation to determine lat/lng offsets for the given distance
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

  // Get current zoom level to scale the font size
  const currentZoom = theMap.getZoom();
  // Base size for zoom level 16
  const baseFontSize = 18;
  const baseZoom = 16;

  // Calculate zoom factor - double size for each zoom level increase
  // At zoom 16 it will be the base size (18px)
  // Each zoom level doubles/halves the size
  const zoomFactor = Math.pow(2.0, currentZoom - baseZoom);
  const fontSize = Math.max(10, Math.min(72, Math.floor(baseFontSize * zoomFactor)));
  const labelWidth = Math.max(80, Math.min(300, Math.floor(140 * zoomFactor)));
  const labelHeight = Math.max(20, Math.min(80, Math.floor(30 * zoomFactor)));

  // Remove existing labels (important to prevent label duplication)
  if (scoutTopLabel.value) {
    scoutTopLabel.value.remove();
    scoutTopLabel.value = null;
  }

  if (scoutBottomLabel.value) {
    scoutBottomLabel.value.remove();
    scoutBottomLabel.value = null;
  }

  // Create top scout range label with zoom-adjusted size
  scoutTopLabel.value = L.marker([topPoint.lat, topPoint.lng], {
    icon: L.divIcon({
      className: 'scout-range-label',
      html: `<div class="scout-range-text" style="font-size: ${fontSize}px;">scout range</div>`,
      iconSize: [labelWidth, labelHeight],
      iconAnchor: [labelWidth / 2, labelHeight] // Bottom center of the icon
    })
  }).addTo(theMap);

  // Create bottom scout range label with zoom-adjusted size
  scoutBottomLabel.value = L.marker([bottomPoint.lat, bottomPoint.lng], {
    icon: L.divIcon({
      className: 'scout-range-label',
      html: `<div class="scout-range-text" style="font-size: ${fontSize}px;">scout range</div>`,
      iconSize: [labelWidth, labelHeight],
      iconAnchor: [labelWidth / 2, 0] // Top center of the icon
    })
  }).addTo(theMap);
}

function centerOnPlayer(): void {
  if (!map.value || !playerCoordinates.value) return

  // Use a constrained zoom level that respects the current map tile limits
  const defaultZoom = 16
  const constrainedZoom = constrainZoom(defaultZoom)
  
  map.value.setView(
      [playerCoordinates.value.lat, playerCoordinates.value.lng],
      constrainedZoom,
      {animate: true}
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

// Add watch for scout range changes
watch(() => questStore.scoutRange, () => {
  if (playerCoordinates.value && map.value) {
    updatePlayerMarker(playerCoordinates.value)
  }
})

// Function to update the route line on the map
function updateRouteLine(): void {
  if (!map.value) return
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

    // Add the polyline to the map with type assertion to fix TS error
    routeLine.value.addTo(map.value as L.Map)
  }
}

// Function to update or create the destination marker
function updateDestinationMarker(): void {
  const theMap = map.value as L.Map
  if (!theMap || !destinationCoordinates.value) return

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
  
  // Check if player has enough tokens to enter the end location
  const hasEnoughTokens = inventoryStore.tokenCount >= questStore.minimumLocations
  
  // Use a vibrant color that stands out, with alpha transparency for the fade
  // Change color to green if player has enough tokens, red otherwise
  const primaryColor = hasEnoughTokens ? '#22DD33' : '#FF5500' // Green or bright orange

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
      <circle cx="${svgSize/2}" cy="${svgSize/2}" r="${svgSize/2}" fill="url(#fade)" />stroke="white" stroke-width="3" />
    </svg>
  `

  // Create the destination marker with the SVG icon, specifying the destinationPane
  destinationMarker.value = L.marker([destinationCoordinates.value.lat, destinationCoordinates.value.lng], {
    icon: L.divIcon({
      className: hasEnoughTokens ? 'destination-marker accessible' : 'destination-marker',
      html: svg,
      iconSize: [svgSize, svgSize],
      iconAnchor: [svgSize/2, svgSize/2]
    }),
    pane: 'destinationPane' // Use our custom pane that's below the marker pane
  }).addTo(theMap)
}

// Watch for route changes to update the line
watch(routeCoordinates, () => {
  updateRouteLine()
}, {deep: true})

// Watch for zoom changes to update the destination marker size
watch(mapZoom, () => {
  updateDestinationMarker()
})

// Watch for destination coordinate changes
watch(destinationCoordinates, () => {
  // Recreate markers to ensure proper z-index ordering
  if (map.value) {
    // First update destination marker
    updateDestinationMarker()
    // Then regenerate location markers to ensure they're on top
    generateGameLocationMarkers()
  }
}, { deep: true })

// Watch for token count changes to update the destination marker color
watch(() => inventoryStore.tokenCount, () => {
  if (map.value && destinationCoordinates.value) {
    updateDestinationMarker()
  }
})

// Function to toggle teleport mode for debug
function toggleTeleportMode(): void {
  if (!map.value || !questStore.isDebugMode) return

  teleportModeActive.value = !teleportModeActive.value

  // Remove existing click handler if it exists
  if (teleportClickHandler.value && map.value) {
    map.value.off('click', teleportClickHandler.value)
    teleportClickHandler.value = null
  }

  // If teleport mode is active, add new click handler
  if (teleportModeActive.value && map.value) {
    teleportClickHandler.value = (e: L.LeafletMouseEvent) => {
      const newCoords: Coordinates = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      }

      // Update player coordinates in appStore
      appStore.setPlayerCoordinates(newCoords)

      // Disable teleport mode after use
      teleportModeActive.value = false

      // Remove this click handler
      if (map.value && teleportClickHandler.value) {
        map.value.off('click', teleportClickHandler.value)
        teleportClickHandler.value = null
      }
    }

    // Add the new click handler
    map.value.on('click', teleportClickHandler.value)
  }
}

// Function to update player marker during zoom animation
function updatePlayerMarkerDuringZoom(startZoom: number, targetZoom: number, progress: number): void {
  if (!map.value || !playerMarker.value) return
  
  // Get the players icon from the location types
  const playersType = locationTypesById['players' as keyof typeof locationTypesById]
  if (!playersType || !playersType.scale || !playersType.size) return
  
  // Calculate interpolated zoom level
  const interpolatedZoom = startZoom + (targetZoom - startZoom) * progress
  
  // Update player marker for the current zoom level
  updatePlayerMarkerForZoom(interpolatedZoom)
}

// Update the markers during zoom animation
function updateMarkersForZoomAnimation(startZoom: number, targetZoom: number, progress: number): void {
  if (!map.value) return
  
  // Calculate interpolated zoom level
  const interpolatedZoom = startZoom + (targetZoom - startZoom) * progress
  
  // Update each marker individually to avoid breaking Leaflet's animations
  locationMarkers.value.forEach((marker) => {
    // @ts-ignore - we're accessing our custom property
    const location = marker.locationData as GameLocation
    if (!location) return
    
    // Update marker during animation
    updateMarkerIconForZoom(marker, location, interpolatedZoom)
  })
  
  // Update destination marker
  if (destinationMarker.value && destinationCoordinates.value) {
    updateDestinationMarkerForZoom(interpolatedZoom)
  }
  
  // Update scout range labels
  if (playerCoordinates.value && map.value) {
    updateScoutRangeLabelsForZoom(interpolatedZoom)
  }
}

// New utility function to update a marker's icon based on zoom level without breaking animations
function updateMarkerIconForZoom(marker: any, location: GameLocation, zoomLevel: number): void {
  // Get the location type
  let locationType = locationTypesById[location.type]
  if (!locationType || !locationType.scale || !locationType.size) return
  
  // Calculate new size
  const baseZoom = 16
  const zoomFactor = Math.pow(2.0, zoomLevel - baseZoom)
  const sizeReduction = location.type === 'stash' ? 0.5 : 1.0
  const globalSizeReduction = 0.36
  
  // Calculate dimensions
  let scaledWidth = Math.floor(locationType.size[0] * zoomFactor * sizeReduction * globalSizeReduction)
  let scaledHeight = Math.floor(locationType.size[1] * zoomFactor * sizeReduction * globalSizeReduction)
  
  // Enforce minimum size while preserving aspect ratio
  const minSize = 20
  const originalAspectRatio = locationType.size[0] / locationType.size[1]
  
  if (scaledWidth < minSize || scaledHeight < minSize) {
    if (originalAspectRatio >= 1) {
      // Wider than tall
      if (scaledWidth < minSize) {
        scaledWidth = minSize
        scaledHeight = Math.max(minSize / 2, Math.floor(scaledWidth / originalAspectRatio))
      }
    } else {
      // Taller than wide
      if (scaledHeight < minSize) {
        scaledHeight = minSize
        scaledWidth = Math.max(minSize / 2, Math.floor(scaledHeight * originalAspectRatio))
      }
    }
  }
  
  // Create updated icon properties
  const iconProperties: IconOptions = {
    iconUrl: `./icons/${locationType.filename}`,
    shadowUrl: `./icons/shadows/${locationType.filename}`,
    iconSize: [scaledWidth, scaledHeight],
    iconAnchor: [scaledWidth / 2, scaledHeight],
    popupAnchor: [0, -Math.round(scaledHeight * 0.2)],
  }
  
  // Set anchor if available
  if (locationType.anchor) {
    const anchorX = Math.floor(locationType.anchor[0] * zoomFactor * sizeReduction * globalSizeReduction)
    const anchorY = Math.floor(locationType.anchor[1] * zoomFactor * sizeReduction * globalSizeReduction)
    iconProperties.iconAnchor = [anchorX, anchorY]
  }
  
  // Set shadow size if available
  if (locationType.shadowSize) {
    const shadowWidth = Math.floor(locationType.shadowSize[0] * zoomFactor * sizeReduction * globalSizeReduction)
    const shadowHeight = Math.floor(locationType.shadowSize[1] * zoomFactor * sizeReduction * globalSizeReduction)
    iconProperties.shadowSize = [shadowWidth, shadowHeight]
  }
  
  // Set shadow anchor if available
  if (locationType.shadowAnchor) {
    const shadowAnchorX = Math.floor(locationType.shadowAnchor[0] * zoomFactor * sizeReduction * globalSizeReduction)
    const shadowAnchorY = Math.floor(locationType.shadowAnchor[1] * zoomFactor * sizeReduction * globalSizeReduction)
    iconProperties.shadowAnchor = [shadowAnchorX, shadowAnchorY]
  }
  
  // Update the marker's icon with the new size
  marker.setIcon(L.icon(iconProperties))
}

// New helper function for player marker during zoom
function updatePlayerMarkerForZoom(zoomLevel: number): void {
  if (!map.value || !playerMarker.value) return
  
  const playersType = locationTypesById['players' as keyof typeof locationTypesById]
  if (!playersType || !playersType.scale || !playersType.size) return
  
  // Calculate size based on zoom level
  const baseZoom = 16
  const zoomFactor = Math.pow(2.0, zoomLevel - baseZoom)
  const globalSizeReduction = 0.36
  
  // Create icon properties
  const iconProperties: IconOptions = {
    iconUrl: `./icons/${playersType.filename}`,
    shadowUrl: `./icons/shadows/${playersType.filename}`,
    iconSize: [67, 83],
    iconAnchor: [34, 83],
    popupAnchor: [0, -30],
    shadowSize: [161, 100],
    shadowAnchor: [10, 90],
  }
  
  // Set scaled dimensions
  if (playersType.size) {
    let scaledWidth = Math.floor(playersType.size[0] * zoomFactor * globalSizeReduction)
    let scaledHeight = Math.floor(playersType.size[1] * zoomFactor * globalSizeReduction)
    
    // Enforce minimum size while preserving aspect ratio
    const minSize = 20
    const originalAspectRatio = playersType.size[0] / playersType.size[1]
    
    if (scaledWidth < minSize || scaledHeight < minSize) {
      if (originalAspectRatio >= 1) {
        if (scaledWidth < minSize) {
          scaledWidth = minSize
          scaledHeight = Math.max(minSize / 2, Math.floor(scaledWidth / originalAspectRatio))
        }
      } else {
        if (scaledHeight < minSize) {
          scaledHeight = minSize
          scaledWidth = Math.max(minSize / 2, Math.floor(scaledHeight * originalAspectRatio))
        }
      }
    }
    
    iconProperties.iconSize = [scaledWidth, scaledHeight]
  }
  
  // Set anchor if available
  if (playersType.anchor) {
    const scaledAnchorX = Math.floor(playersType.anchor[0] * zoomFactor * globalSizeReduction)
    const scaledAnchorY = Math.floor(playersType.anchor[1] * zoomFactor * globalSizeReduction)
    iconProperties.iconAnchor = [scaledAnchorX, scaledAnchorY]
  }
  
  // Set shadow size/anchor if available
  if (playersType.shadowSize) {
    const scaledShadowWidth = Math.floor(playersType.shadowSize[0] * zoomFactor * globalSizeReduction)
    const scaledShadowHeight = Math.floor(playersType.shadowSize[1] * zoomFactor * globalSizeReduction)
    iconProperties.shadowSize = [scaledShadowWidth, scaledShadowHeight]
  }
  
  if (playersType.shadowAnchor) {
    const scaledShadowAnchorX = Math.floor(playersType.shadowAnchor[0] * zoomFactor * globalSizeReduction)
    const scaledShadowAnchorY = Math.floor(playersType.shadowAnchor[1] * zoomFactor * globalSizeReduction)
    iconProperties.shadowAnchor = [scaledShadowAnchorX, scaledShadowAnchorY]
  }
  
  // Update the player marker's icon
  playerMarker.value.setIcon(L.icon(iconProperties))
}

// New helper function for destination marker during zoom
function updateDestinationMarkerForZoom(zoomLevel: number): void {
  if (!map.value || !destinationMarker.value) return
  
  // Calculate size based on zoom level
  const baseSize = 240
  const baseZoom = 16
  const zoomFactor = Math.pow(2.0, zoomLevel - baseZoom)
  const circleSize = Math.max(60, Math.min(300, Math.floor(baseSize * zoomFactor)))
  
  // Check if player has enough tokens to enter the end location
  const hasEnoughTokens = inventoryStore.tokenCount >= questStore.minimumLocations
  
  // Create SVG with radial gradient for fade effect
  const svgSize = circleSize * 2
  const primaryColor = hasEnoughTokens ? '#22DD33' : '#FF5500'
  
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
      <circle cx="${svgSize/2}" cy="${svgSize/2}" r="${svgSize/2}" fill="url(#fade)" />stroke="white" stroke-width="3" />
    </svg>
  `
  
  // Update the destination marker's icon
  destinationMarker.value.setIcon(L.divIcon({
    className: hasEnoughTokens ? 'destination-marker accessible' : 'destination-marker',
    html: svg,
    iconSize: [svgSize, svgSize],
    iconAnchor: [svgSize/2, svgSize/2]
  }))
}

// New helper function for scout range labels during zoom
function updateScoutRangeLabelsForZoom(zoomLevel: number): void {
  if (!map.value) return

  // Calculate size based on zoom level
  const baseFontSize = 18
  const baseZoom = 16
  const zoomFactor = Math.pow(2.0, zoomLevel - baseZoom)
  const fontSize = Math.max(10, Math.min(72, Math.floor(baseFontSize * zoomFactor)))
  const labelWidth = Math.max(80, Math.min(300, Math.floor(140 * zoomFactor)))
  const labelHeight = Math.max(20, Math.min(80, Math.floor(30 * zoomFactor)))
  
  // Update top label if it exists
  if (scoutTopLabel.value) {
    scoutTopLabel.value.setIcon(L.divIcon({
      className: 'scout-range-label',
      html: `<div class="scout-range-text" style="font-size: ${fontSize}px;">scout range</div>`,
      iconSize: [labelWidth, labelHeight],
      iconAnchor: [labelWidth / 2, labelHeight]
    }))
  }
  
  // Update bottom label if it exists
  if (scoutBottomLabel.value) {
    scoutBottomLabel.value.setIcon(L.divIcon({
      className: 'scout-range-label',
      html: `<div class="scout-range-text" style="font-size: ${fontSize}px;">scout range</div>`,
      iconSize: [labelWidth, labelHeight],
      iconAnchor: [labelWidth / 2, 0]
    }))
  }
}

// Helper function to constrain zoom to the current map tile limits
function constrainZoom(zoom: number): number {
  const tile = currentMapTile.value
  const maxZoom = tile.maxZoom || 19
  const minZoom = tile.minZoom || 1
  
  return Math.min(Math.max(zoom, minZoom), maxZoom)
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
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

:deep(.leaflet-control-center) {
  font-size: 22px;
  font-weight: bold;
}

/* Popup styles */
:deep(.location-info-popup) {
  max-width: 90vw !important;
}

:deep(.location-info-popup .leaflet-popup-content-wrapper) {
  background: rgba(30, 30, 30, 0.95);
  border-radius: 12px;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.7);
  padding: 5px;
}

:deep(.location-info-popup .leaflet-popup-tip) {
  background: rgba(30, 30, 30, 0.95);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.7);
}

:deep(.location-info-popup .leaflet-popup-content) {
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
  :deep(.location-info-popup) {
    max-width: 95vw !important;
  }

  :deep(.location-info-popup .leaflet-popup-content) {
    max-height: 70vh;
  }
}

:deep(.scout-range-text) {
  color: #4285F4;
  text-align: center;
  white-space: nowrap;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8), -1px -1px 2px rgba(255, 255, 255, 0.8);
  transition: font-size 0.25s ease-in-out, transform 0.25s ease-in-out;
}

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

/* Style for leaflet icons to ensure smooth transitions during zoom */
:deep(.leaflet-marker-icon) {
  /* Don't disable all transitions, just don't add any extra ones */
}

:deep(.leaflet-marker-icon img) {
  width: 100%;
  height: 100%;
}

/* Don't disable Leaflet's zoom animations */
/* :deep(.leaflet-zoom-animated) {
  transition: none !important;
} */

/* Ensure the SVG scales correctly in the destination marker */
:deep(.destination-marker svg) {
  width: 100%;
  height: 100%;
}
</style> 
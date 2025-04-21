import {defineStore} from 'pinia'
import {computed, ref } from 'vue'
import type {GPSStatus, Item, Coordinates, GameLocationId, ScreenId} from '../types'
import {useLocationStore} from "../stores/locationStore";
import {useLogStore} from "../stores/logStore";
import {useRouteStore} from "../stores/routeStore";
import calculateDistance from "@/utils/calculateDistance";

// Notification interface
interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timeout?: number;
  isEntering: boolean;
  height?: number; // Height of notification for stacking
  centerIndex?: number; // Index in center stack
}

// Center notification registry
interface CenterNotificationPosition {
  id: string;
  height: number;
  index: number;
}

export const useAppStore = defineStore('app', () => {
  const isFetchingGameLocations = ref(false)
  const screen = ref<ScreenId>('start_quest')
  const gpsStatus = ref<GPSStatus>('initializing')
  const playerCoordinates = ref<Coordinates | null>(null)
  const focusGameLocationId = ref<GameLocationId | undefined>(undefined)
  const mapPosition = ref<Coordinates | null>(null)
  const mapZoom = ref<number | null>(null)
  const locationStore = useLocationStore()
  const logStore = useLogStore()
  const routeStore = useRouteStore()
  const routeTrackingInterval = ref<number | null>(null)
  
  // Inventory UI state
  const isInterfaceOpen = ref(false)
  const inventoryTab = ref('items') // 'items', 'quest', 'log', 'options'
  
  // Item inspection state
  const inspectedItem = ref<Item | null>(null)

  // Notifications
  const notifications = ref<Notification[]>([])
  const centerNotifications = ref<CenterNotificationPosition[]>([])
  const centerNotificationCount = ref(0)

  // Debug mode state - initialize from localStorage if available
  const isDebugMode = ref(localStorage.getItem('debug_mode') === 'true')

  const setScreen = (newScreen: ScreenId) => {
    // Log quest start
    if (newScreen === 'intro' && screen.value === 'start_quest') {
      logStore.addLogEntry('Started the quest', 0);
    }
    
    // Handle route tracking based on screen changes
    if (newScreen === 'map' && screen.value !== 'map') {
      // Start route tracking when entering map screen
      startRouteTracking();
    } else if (newScreen !== 'map' && screen.value === 'map') {
      // Stop route tracking when leaving map screen
      stopRouteTracking();
    }
    
    screen.value = newScreen
  }

  const setGPSStatus = (newStatus: GPSStatus) => {
    gpsStatus.value = newStatus
  }

  const setPlayerCoordinates = (newGameLocation: Coordinates | null): boolean => {
    playerCoordinates.value = newGameLocation
    return true
  }

  const setFocusGameLocation = (locationId: GameLocationId) => {
    focusGameLocationId.value = locationId
  }
  
  const unsetFocusGameLocation = () => {
    focusGameLocationId.value = undefined
  }

  const setMapPosition = (position: Coordinates): void => {
    mapPosition.value = position
  }

  const setMapZoom = (zoom: number): void => {
    mapZoom.value = zoom
  }
  
  // Inventory UI actions
  const toggleInterface = (): void => {
    isInterfaceOpen.value = !isInterfaceOpen.value
    // When opening the interface, always set tab to items
    if (isInterfaceOpen.value) {
      inventoryTab.value = 'items'
    }
  }
  
  const openInterface = (tab = 'items'): void => {
    isInterfaceOpen.value = true
    inventoryTab.value = tab
  }
  
  const closeInterface = (): void => {
    isInterfaceOpen.value = false
  }
  
  const setInventoryTab = (tab: string): void => {
    inventoryTab.value = tab
  }
  
  // Notification methods
  const addNotification = (
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    timeout = 10000,
    xp = 0
  ): void => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const centerIndex = centerNotificationCount.value;
    centerNotificationCount.value++;
    
    notifications.value.push({ id, message, type, timeout, isEntering: true, centerIndex });
    
    // Add entry to log store
    logStore.addLogEntry(message, xp);
    
    // Auto-remove after timeout
    if (timeout > 0) {
      setTimeout(() => removeNotification(id), timeout);
    }
  };
  
  const removeNotification = (id: string): void => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };
  
  const exitCenterAnimation = (id: string): void => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1 && notifications.value[index].isEntering) {
      // Store the centerIndex that's being removed
      const removedIndex = notifications.value[index].centerIndex;
      
      // Mark notification as no longer entering
      notifications.value[index].isEntering = false;
      
      // Decrement center notification count
      centerNotificationCount.value = Math.max(0, centerNotificationCount.value - 1);
      
      // Adjust centerIndex for all remaining notifications that were below this one
      if (removedIndex !== undefined) {
        notifications.value.forEach(notification => {
          if (notification.isEntering && notification.centerIndex !== undefined && notification.centerIndex > removedIndex) {
            // Reduce index by 1 for notifications that were below this one
            notification.centerIndex--;
          }
        });
      }
    }
  };

  // Item inspection actions
  const openItemInspectModal = (item: Item): void => {
    inspectedItem.value = item
  }
  
  const closeItemInspectModal = (): void => {
    // Reset inspected item after a short delay to allow for transition animations
    setTimeout(() => {
      inspectedItem.value = null
    }, 300)
  }

  const focusGameLocation = computed(() => {
    if (focusGameLocationId.value === undefined) {
      return undefined
    }
    return locationStore.location(focusGameLocationId.value)
  })

  const setDebugMode = (enabled: boolean): void => {
    isDebugMode.value = enabled
    localStorage.setItem('debug_mode', enabled.toString())
  }

  const toggleDebugMode = (): void => {
    const newValue = !isDebugMode.value
    isDebugMode.value = newValue
    localStorage.setItem('debug_mode', newValue.toString())
  }

  // Start tracking the player's route
  const startRouteTracking = (): void => {
    // Clear any existing interval
    if (routeTrackingInterval.value) {
      window.clearInterval(routeTrackingInterval.value)
    }
    
    // Add the initial player position to the route if available
    if (playerCoordinates.value) {
      routeStore.addRoutePoint(playerCoordinates.value)
    }
    
    // Set up the interval to check the position every minute
    routeTrackingInterval.value = window.setInterval(() => {
      if (!playerCoordinates.value) return
      
      // Get the last coordinate from the route
      const coordinates = routeStore.routeCoordinates
      const lastCoords = coordinates.length > 0 ? coordinates[coordinates.length - 1] : null
      
      if (!lastCoords) {
        // If there are no coords yet, add the current one
        routeStore.addRoutePoint(playerCoordinates.value)
        return
      }
      
      // Calculate distance between current position and last recorded position
      const distance = calculateDistance(lastCoords, playerCoordinates.value)
      
      // If distance is more than 50 meters, add new point to route
      if (distance > 50) {
        routeStore.addRoutePoint(playerCoordinates.value)
      }
    }, 60000) // Check every minute
  }
  
  // Stop tracking the player's route
  const stopRouteTracking = (): void => {
    if (routeTrackingInterval.value) {
      window.clearInterval(routeTrackingInterval.value)
      routeTrackingInterval.value = null
    }
  }

  return {
    isFetchingGameLocations,
    screen,
    gpsStatus,
    playerCoordinates,
    mapPosition,
    mapZoom,
    focusGameLocation,
    isInterfaceOpen,
    inventoryTab,
    inspectedItem,
    notifications,
    centerNotifications,
    centerNotificationCount,
    isDebugMode,
    setDebugMode,
    toggleDebugMode,
    setFocusGameLocation,
    unsetFocusGameLocation,
    setScreen,
    setGPSStatus,
    setPlayerCoordinates,
    setMapPosition,
    setMapZoom,
    toggleInterface,
    openInterface,
    closeInterface,
    setInventoryTab,
    addNotification,
    removeNotification,
    exitCenterAnimation,
    openItemInspectModal,
    closeItemInspectModal,
    startRouteTracking,
    stopRouteTracking
  }
}) 

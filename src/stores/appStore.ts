import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {GPSStatus, Item, Location, PubId, ScreenId} from '../types'
import {usePubStore} from "../stores/pubStore";

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
  const isFetchingPubs = ref(false)
  const screen = ref<ScreenId>('start_quest')
  const gpsStatus = ref<GPSStatus>('initializing')
  const playerLocation = ref<Location | null>(null)
  const focusPubId = ref< PubId | undefined>(undefined)
  const mapPosition = ref<Location | null>(null)
  const mapZoom = ref<number | null>(null)
  const pubStore = usePubStore()
  
  // Inventory UI state
  const isInterfaceOpen = ref(false)
  const inventoryTab = ref('items') // 'items', 'quest', 'log', 'options'
  
  // Item inspection state
  const inspectedItem = ref<Item | null>(null)

  // Notifications
  const notifications = ref<Notification[]>([])
  const centerNotifications = ref<CenterNotificationPosition[]>([])
  const centerNotificationCount = ref(0)

  const setScreen = (newScreen: ScreenId) => {
    screen.value = newScreen
  }

  const setGPSStatus = (newStatus: GPSStatus) => {
    gpsStatus.value = newStatus
  }

  const setPlayerLocation = (newLocation: Location | null): boolean => {
    playerLocation.value = newLocation
    return true
  }

  const setFocusPub = (pubId:PubId) =>{
    focusPubId.value = pubId
  }
  const unsetFocusPub = () =>{
    focusPubId.value = undefined
  }

  const setMapPosition = (position: Location): void => {
    mapPosition.value = position
  }

  const setMapZoom = (zoom: number): void => {
    mapZoom.value = zoom
  }
  
  // Inventory UI actions
  const toggleInventory = (): void => {
    isInterfaceOpen.value = !isInterfaceOpen.value
  }
  
  const openInventory = (tab = 'items'): void => {
    isInterfaceOpen.value = true
    inventoryTab.value = tab
  }
  
  const closeInventory = (): void => {
    isInterfaceOpen.value = false
  }
  
  const setInventoryTab = (tab: string): void => {
    inventoryTab.value = tab
  }
  
  // Notification methods
  const addNotification = (
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    timeout = 3000
  ): void => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const centerIndex = centerNotificationCount.value;
    centerNotificationCount.value++;
    
    notifications.value.push({ id, message, type, timeout, isEntering: true, centerIndex });
    console.log("NOTIFICATION: " + message);
    
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
      notifications.value[index].isEntering = false;
      
      // Decrement center notification count after a brief delay
      // to ensure smooth stacking transitions
      setTimeout(() => {
        centerNotificationCount.value = Math.max(0, centerNotificationCount.value - 1);
      }, 100);
    }
  };

  const addToCenterRegistry = (id: string, height: number): number => {
    // Get next index (how many notifications are already in center)
    const index = centerNotifications.value.length;
    
    // Add to registry
    centerNotifications.value.push({ id, height, index });
    
    return index;
  }
  
  const removeCenterNotification = (id: string): void => {
    const index = centerNotifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      centerNotifications.value.splice(index, 1);
      
      // Update indices for remaining notifications
      centerNotifications.value.forEach((n, i) => {
        if (i >= index) {
          n.index = i;
        }
      });
    }
  }

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

  const focusPub = computed(() => {
    if (focusPubId.value === undefined) {
      return undefined
    }
    return pubStore.pub(focusPubId.value)
  })


  return {
    isFetchingPubs,
    screen,
    gpsStatus,
    playerLocation,
    mapPosition,
    mapZoom,
    focusPub,
    isInterfaceOpen,
    inventoryTab,
    inspectedItem,
    notifications,
    centerNotifications,
    centerNotificationCount,
    setFocusPub,
    unsetFocusPub,
    setScreen,
    setGPSStatus,
    setPlayerLocation,
    setMapPosition,
    setMapZoom,
    toggleInventory,
    openInventory,
    closeInventory,
    setInventoryTab,
    addNotification,
    removeNotification,
    exitCenterAnimation,
    addToCenterRegistry,
    removeCenterNotification,
    openItemInspectModal,
    closeItemInspectModal
  }
}) 
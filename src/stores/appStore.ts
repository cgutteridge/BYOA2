import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {GPSStatus, Location, PubId, ScreenId} from '../types'
import type { Item } from '../types/item'
import {usePubStore} from "../stores/pubStore";

// Notification interface
interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timeout?: number;
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
  const isInventoryOpen = ref(false)
  const inventoryTab = ref('items') // 'items', 'quest', 'log', 'options'
  
  // Item inspection state
  const inspectedItem = ref<Item | null>(null)

  // Notifications
  const notifications = ref<Notification[]>([])

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
    isInventoryOpen.value = !isInventoryOpen.value
  }
  
  const openInventory = (tab = 'items'): void => {
    isInventoryOpen.value = true
    inventoryTab.value = tab
  }
  
  const closeInventory = (): void => {
    isInventoryOpen.value = false
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
    notifications.value.push({ id, message, type, timeout });
    
    // Auto-remove after timeout
    if (timeout > 0) {
      setTimeout(() => removeNotification(id), timeout);
    }
  }
  
  const removeNotification = (id: string): void => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
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
    isInventoryOpen,
    inventoryTab,
    inspectedItem,
    notifications,
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
    openItemInspectModal,
    closeItemInspectModal
  }
}) 
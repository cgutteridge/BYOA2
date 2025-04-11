import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import type {GPSStatus, Location, PubId, ScreenId} from '../types'
import {usePubStore} from "../stores/pubStore";

export const useAppStore = defineStore('app', () => {
  const isFetchingPubs = ref(false)
  const screen = ref<ScreenId>('start_quest')
  const gpsStatus = ref<GPSStatus>('initializing')
  const playerLocation = ref<Location | null>(null)
  const focusPubId = ref< PubId | undefined>(undefined)
  const mapPosition = ref<Location | null>(null)
  const mapZoom = ref<number | null>(null)
  const pubStore = usePubStore()

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
    setFocusPub,
    unsetFocusPub,
    setScreen,
    setGPSStatus,
    setPlayerLocation,
    setMapPosition,
    setMapZoom
  }
}) 
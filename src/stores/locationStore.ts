import {defineStore} from 'pinia'
import {ref} from 'vue'
import type {GameLocationTypeId, GameLocation, GameLocationId} from '../types'
import {GameLocationDifficulty} from '../types'
import {useAppStore} from './appStore'
import {useQuestStore} from './questStore'
import fetchNearbyGameLocations from "../api/overpass.ts"
import calculateDistance from '../utils/calculateDistance.ts'

export const useLocationStore = defineStore('locations', () => {
  const appStore = useAppStore()
  const questStore = useQuestStore()
  const persist = ref(['locations'])

  const locations = ref<GameLocation[]>([])

  const setLocations = (newLocations: GameLocation[]) => {
    locations.value = newLocations
  }

  // Set difficulty for a specific location
  const setGameLocationDifficulty = (locationId: GameLocationId, difficulty: GameLocationDifficulty) => {
    const targetGameLocation = location(locationId)
    targetGameLocation.difficulty = difficulty
  }

  // Set type for a specific location
  const setGameLocationType = (locationId: GameLocationId, type: GameLocationTypeId) => {
    const targetGameLocation = location(locationId)
    targetGameLocation.type = type
  }

  // Set hasToken flag for a specific location
  const setGameLocationHasToken = (locationId: GameLocationId, hasToken: boolean) => {
    const targetGameLocation = location(locationId)
    targetGameLocation.hasToken = hasToken
  }

  const fetchNearbyGameLocationsFromAPI = async () => {
    if (!appStore.playerCoordinates) return
    
    appStore.isFetchingGameLocations = true
    try {
      const { lat, lng } = appStore.playerCoordinates
      const newGameLocations = await fetchNearbyGameLocations(lat, lng, 3000)
      setLocations(newGameLocations)
    } catch (error) {
      console.error('Error fetching locations:', error)
      // Set empty locations array on error
      setLocations([])
    } finally {
      appStore.isFetchingGameLocations = false
    }
  }

  const location = (locationId: GameLocationId): GameLocation => {
    const foundGameLocation = locations.value.find(p => p.id === locationId)
    if (!foundGameLocation) {
      throw new Error(`GameLocation with ID ${locationId} not found`)
    }
    return foundGameLocation
  }

  return {
    locations,
    setGameLocations: setLocations,
    fetchNearbyGameLocations: fetchNearbyGameLocationsFromAPI,
    location,
    setGameLocationDifficulty,
    setGameLocationType,
    setGameLocationHasToken,
    persist
  }
}) 
import {defineStore} from 'pinia'
import {ref} from 'vue'
import type {GameLocationTypeId, GameLocation, GameLocationId} from '../types'
import {GameLocationDifficulty} from '../types'
import {useAppStore} from './appStore'
import fetchNearbyGameLocations from "../api/overpass.ts"
import calculateDistance from '../utils/calculateDistance.ts'

export const useLocationStore = defineStore('locations', () => {
  const appStore = useAppStore()
  const persist = ref(['locations'])

  const locations = ref<GameLocation[]>([])

  const setLocations = (newLocations: GameLocation[]) => {
    locations.value = newLocations
  }

  // Set difficulty for a specific gameLocation
  const setGameLocationDifficulty = (gameLocationId: GameLocationId, difficulty: GameLocationDifficulty) => {
    const targetGameLocation = gameLocation(gameLocationId)
    targetGameLocation.difficulty = difficulty
  }

  // Set type for a specific gameLocation
  const setGameLocationType = (gameLocationId: GameLocationId, type: GameLocationTypeId) => {
    const targetGameLocation = gameLocation(gameLocationId)
    targetGameLocation.gameLocationType = type
  }

  // Check if a gameLocation can be scouted based on player's distance to it (within 50 meters)
  const canScout = (gameLocationId: GameLocationId): boolean => {
    if (!appStore.playerCoordinates) return false
    
    try {
      const targetGameLocation = gameLocation(gameLocationId)
      const distance = calculateDistance(
        appStore.playerCoordinates.lat,
        appStore.playerCoordinates.lng,
        targetGameLocation.lat,
        targetGameLocation.lng
      )
      
      return distance <= 20000
    } catch (error) {
      console.error(`Error checking if gameLocation can be scouted: ${error}`)
      return false
    }
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

  const gameLocation = (gameLocationId: GameLocationId): GameLocation => {
    const foundGameLocation = locations.value.find(p => p.id === gameLocationId)
    if (!foundGameLocation) {
      throw new Error(`GameLocation with ID ${gameLocationId} not found`)
    }
    return foundGameLocation
  }

  return {
    locations,
    setGameLocations: setLocations,
    fetchNearbyGameLocations: fetchNearbyGameLocationsFromAPI,
    gameLocation,
    canScout,
    setGameLocationDifficulty,
    setGameLocationType,
    persist
  }
}) 
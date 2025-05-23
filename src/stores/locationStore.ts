import {defineStore} from 'pinia'
import {ref} from 'vue'
import {GameLocation, GameLocationId, GameLocationTypeId} from '../types'
import {GameLocationDifficulty} from '../types'
import {useAppStore} from './appStore'
import {fetchNearbyGameLocations} from "@/api/overpass.ts";
import calculateDistance from '@/utils/calculateDistance.ts'

export const useLocationStore = defineStore('locations', () => {
  const appStore = useAppStore()
  const persist = ref(['locations'])

  const locations = ref<GameLocation[]>([])

  const setLocations = (newLocations: GameLocation[]) => {
    // Sort locations by distance from player if player coordinates exist
    if (appStore.playerCoordinates) {
      newLocations.sort((a, b) => {
        const distanceA = calculateDistance(appStore.playerCoordinates!, a.coordinates)
        const distanceB = calculateDistance(appStore.playerCoordinates!, b.coordinates)
        return distanceA - distanceB
      })
    }
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

  // Get defeatedEnemies count for a specific location
  const getDefeatedEnemiesCount = (locationId: GameLocationId): number => {
    const targetGameLocation = location(locationId)
    return targetGameLocation.defeatedEnemies
  }

  // Increment defeatedEnemies count for a specific location
  const incrementDefeatedEnemiesCount = (locationId: GameLocationId): void => {
    const targetGameLocation = location(locationId)
    targetGameLocation.defeatedEnemies = (targetGameLocation.defeatedEnemies || 0) + 1
  }

  // Get hasBeenVisited flag for a specific location
  const getHasBeenVisited = (locationId: GameLocationId): boolean => {
    const targetGameLocation = location(locationId)
    return targetGameLocation.hasBeenVisited
  }

  // Set hasBeenVisited flag for a specific location
  const setHasBeenVisited = (locationId: GameLocationId, visited: boolean): void => {
    const targetGameLocation = location(locationId)
    targetGameLocation.hasBeenVisited = visited
  }

  // Get viewed flag for a specific location
  const getViewed = (locationId: GameLocationId): boolean => {
    const targetGameLocation = location(locationId)
    return targetGameLocation.viewed
  }

  // Set viewed flag for a specific location
  const setViewed = (locationId: GameLocationId, viewed: boolean): void => {
    const targetGameLocation = location(locationId)
    targetGameLocation.viewed = viewed
  }

  const fetchNearbyGameLocationsFromAPI = async () => {
    if (!appStore.playerCoordinates) return

    setLocations([])
    appStore.isFetchingGameLocations = true
    try {
      const newGameLocations = await fetchNearbyGameLocations(appStore.playerCoordinates, 3000)
      setLocations(newGameLocations)
    } catch (error) {
      console.error('Error fetching locations:', error)
      // Set empty locations array on error
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
    getDefeatedEnemiesCount,
    incrementDefeatedEnemiesCount,
    getHasBeenVisited,
    setHasBeenVisited,
    getViewed,
    setViewed,
    persist
  }
}) 
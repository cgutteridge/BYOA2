import {defineStore} from 'pinia'
import {ref} from 'vue'
import type {LocationTypeId, Location, LocationId} from '../types'
import {LocationDifficulty} from '../types'
import {useAppStore} from './appStore'
import fetchNearbyLocations from "../api/overpass.ts"
import {scoutLocation} from '../quest/scoutLocation.ts'
import calculateDistance from '../utils/calculateDistance.ts'

export const useLocationStore = defineStore('location', () => {
  const appStore = useAppStore()
  const persist = ref(['locations'])

  const locations = ref<Location[]>([])

  const setLocations = (newLocations: Location[]) => {
    locations.value = newLocations
  }

  // Set difficulty for a specific location
  const setLocationDifficulty = (locationId: LocationId, difficulty: LocationDifficulty) => {
    const targetLocation = location(locationId)
    targetLocation.difficulty = difficulty
  }

  // Set type for a specific location
  const setLocationType = (locationId: LocationId, type: LocationTypeId) => {
    const targetLocation = location(locationId)
    targetLocation.locationType = type
  }

  // Check if a location can be scouted based on player's distance to it (within 50 meters)
  const canScout = (locationId: LocationId): boolean => {
    if (!appStore.playerCoordinates) return false
    
    try {
      const targetLocation = location(locationId)
      const distance = calculateDistance(
        appStore.playerCoordinates.lat,
        appStore.playerCoordinates.lng,
        targetLocation.lat,
        targetLocation.lng
      )
      
      return distance <= 20000
    } catch (error) {
      console.error(`Error checking if location can be scouted: ${error}`)
      return false
    }
  }

  const fetchNearbyLocationsFromAPI = async () => {
    if (!appStore.playerCoordinates) return
    
    appStore.isFetchingLocations = true
    try {
      const { lat, lng } = appStore.playerCoordinates
      const newLocations = await fetchNearbyLocations(lat, lng, 3000)
      setLocations(newLocations)
    } catch (error) {
      console.error('Error fetching locations:', error)
      // Set empty locations array on error
      setLocations([])
    } finally {
      appStore.isFetchingLocations = false
    }
  }

  const location = (locationId: LocationId): Location => {
    const foundLocation = locations.value.find(p => p.id === locationId)
    if (!foundLocation) {
      throw new Error(`Location with ID ${locationId} not found`)
    }
    return foundLocation
  }

  return {
    locations,
    setLocations,
    fetchNearbyLocations: fetchNearbyLocationsFromAPI,
    scoutLocation: scoutLocation,
    location,
    canScout,
    setLocationDifficulty,
    setLocationType,
    persist
  }
}) 
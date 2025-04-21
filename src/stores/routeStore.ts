import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Coordinates } from '../types'

export const useRouteStore = defineStore('route', () => {
  // Store the route as a list of coordinates
  const routeCoordinates = ref<Coordinates[]>([])
  
  // Define which properties should be persisted
  const persist = ref(['routeCoordinates'])
  
  /**
   * Add a new coordinate point to the route
   */
  const addRoutePoint = (coordinates: Coordinates): void => {
    routeCoordinates.value.push(coordinates)
  }
  
  /**
   * Clear all route coordinates
   */
  const clearRoute = (): void => {
    routeCoordinates.value = []
  }
  
  return {
    routeCoordinates,
    persist,
    addRoutePoint,
    clearRoute
  }
}) 
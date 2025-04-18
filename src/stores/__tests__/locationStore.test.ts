// @vitest-environment jsdom

import { useLocationStore } from '../locationStore'
import { Location, toLocationId, toLocationTypeId } from '../../types'
import { createPinia, setActivePinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import calculateDistance from '@/utils/calculateDistance'

// Mock dependencies
vi.mock('@/utils/calculateDistance', () => {
  return {
    default: vi.fn(() => 10) // Default to 10 meters
  }
})

describe('locationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should set locations', () => {
    const locationStore = useLocationStore()
    const mockLocations: Location[] = [{
      id: toLocationId('123'),
      name: 'Test Location',
      lat: 51.5074,
      lng: -0.1278,
      locationType: toLocationTypeId('pub'),
      scouted: false
    }]

    locationStore.setLocations(mockLocations)
    expect(locationStore.locations).toEqual(mockLocations)
  })

  it('should get a location by ID', () => {
    const locationStore = useLocationStore()
    const location1Id = toLocationId('123')
    const location2Id = toLocationId('456')
    
    locationStore.setLocations([
      {
        id: location1Id,
        name: 'Location 1',
        lat: 51.5074,
        lng: -0.1278,
        locationType: toLocationTypeId('pub'),
        scouted: false
      },
      {
        id: location2Id,
        name: 'Location 2',
        lat: 51.5074,
        lng: -0.1278,
        locationType: toLocationTypeId('pub'),
        scouted: false
      }
    ])

    expect(locationStore.location(location1Id).name).toBe('Location 1')
    expect(locationStore.location(location2Id).name).toBe('Location 2')
  })

  it('should throw error when location not found', () => {
    const locationStore = useLocationStore()
    locationStore.setLocations([])
    
    expect(() => {
      locationStore.location(toLocationId('123'))
    }).toThrow('Location with ID 123 not found')
  })

  it('should check if location can be scouted', () => {
    const locationStore = useLocationStore()
    const locationId = toLocationId('123')
    
    locationStore.setLocations([
      {
        id: locationId,
        name: 'Test Location',
        lat: 51.5074,
        lng: -0.1278,
        locationType: toLocationTypeId('pub'),
        scouted: false
      }
    ])

    // Test with distance within range
    calculateDistance.mockReturnValueOnce(15000) // 15 km, within 20 km range
    expect(locationStore.canScout(locationId)).toBe(true)

    // Test with distance outside range
    calculateDistance.mockReturnValueOnce(25000) // 25 km, outside 20 km range
    expect(locationStore.canScout(locationId)).toBe(false)
  })
}) 
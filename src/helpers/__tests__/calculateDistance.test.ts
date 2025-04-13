import { describe, it, expect } from 'vitest'
import calculateDistance from '../calculateDistance'

describe('calculateDistance', () => {
  // Test same coordinates (distance should be 0)
  it('should return 0 when coordinates are the same', () => {
    const lat = 50.9
    const lng = -1.4
    const distance = calculateDistance(lat, lng, lat, lng)
    expect(distance).toBeCloseTo(0, 5)
  })

  // Test known distance between two points
  it('should calculate distance between Southampton and London correctly', () => {
    // Southampton coordinates
    const southamptonLat = 50.9097
    const southamptonLng = -1.4044
    
    // London coordinates
    const londonLat = 51.5074
    const londonLng = -0.1278
    
    // Distance between Southampton and London is approximately 111 km or 111,000 meters
    const distance = calculateDistance(southamptonLat, southamptonLng, londonLat, londonLng)
    expect(distance).toBeCloseTo(111000, 0) // We expect approximately 111,000 meters, with 0 decimal precision
  })

  // Test distance calculation across meridian
  it('should calculate distance correctly across the meridian', () => {
    // Greenwich, London (on the meridian)
    const greenwichLat = 51.4779
    const greenwichLng = 0.0015
    
    // Point west of Greenwich
    const westPointLat = 51.4779
    const westPointLng = -1.0000
    
    // Expected distance approximately 69.4 km or 69,400 meters
    const distance = calculateDistance(greenwichLat, greenwichLng, westPointLat, westPointLng)
    expect(distance).toBeCloseTo(69400, 0) // Within 1 meter precision
  })

  // Test distance calculation across equator
  it('should calculate distance correctly across the equator', () => {
    // Point north of equator
    const northLat = 1.0
    const northLng = 10.0
    
    // Point south of equator
    const southLat = -1.0
    const southLng = 10.0
    
    // Expected distance approximately 222 km or 222,000 meters
    const distance = calculateDistance(northLat, northLng, southLat, southLng)
    expect(distance).toBeCloseTo(222000, 0) // Within 1 meter precision
  })

  // Test with very small distance (a few meters)
  it('should handle very small distances accurately', () => {
    // Two points about 10 meters apart
    const lat1 = 50.9097
    const lng1 = -1.4044
    
    // Approximately 10 meters east (very small longitude difference)
    const lat2 = 50.9097
    const lng2 = -1.40435
    
    const distance = calculateDistance(lat1, lng1, lat2, lng2)
    expect(distance).toBeGreaterThan(1) // Should detect a non-zero distance
    expect(distance).toBeLessThan(30) // Should be a small distance (meters)
  })

  // Test with antipodal points (opposite sides of the Earth)
  it('should calculate maximum distance for antipodal points', () => {
    // New York City
    const nycLat = 40.7128
    const nycLng = -74.0060
    
    // Approximate antipodal point in Indian Ocean
    const antipodalLat = -40.7128
    const antipodalLng = 106.0060
    
    const distance = calculateDistance(nycLat, nycLng, antipodalLat, antipodalLng)
    // Earth's approximate diameter is ~12,742 km, so half-circumference is ~20,015 km or ~20,015,000 meters
    expect(distance).toBeGreaterThan(19000000) // Should be close to max Earth distance in meters
  })
}) 
/**
 * Calculates the distance between two geographic coordinates in meters.
 * Uses the Haversine formula to account for the Earth's curvature.
 * 
 * @param point1 - First coordinates
 * @param point2 - Second coordinates
 * @returns Distance between the points in meters
 */
import type {Coordinates} from '@/types'

export default function calculateDistance(point1: Coordinates, point2: Coordinates): number {
    // console.log('calculateDistance', point1, point2)
    const R = 6371000 // Earth's radius in meters (was 6371 km)
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLng = (point2.lng - point1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    // Distance in meters
    return R * c
}
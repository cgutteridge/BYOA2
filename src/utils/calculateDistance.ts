/**
 * Calculates the distance between two geographic coordinates in meters.
 * Uses the Haversine formula to account for the Earth's curvature.
 * 
 * @param lat1 - Latitude of the first point in decimal degrees
 * @param lng1 - Longitude of the first point in decimal degrees
 * @param lat2 - Latitude of the second point in decimal degrees
 * @param lng2 - Longitude of the second point in decimal degrees
 * @returns Distance between the points in meters
 */
export default function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    console.log('calculateDistance', lat1, lng1, lat2, lng2)
    const R = 6371000 // Earth's radius in meters (was 6371 km)
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c  // Distance in meters
    console.log('distance (meters)', distance)
    return distance
}
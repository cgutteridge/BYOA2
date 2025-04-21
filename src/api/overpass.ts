import {GameLocation, toGameLocationId, toGameLocationTypeId} from "@/types";

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
]

export default async function fetchNearbyGameLocations(lat: number, lng: number, radius: number = 5000): Promise<GameLocation[]> {
  const overpassQuery = `
    [out:json][timeout:100];
    nwr["amenity"~"^(pub|bar)$"]["name"](around:${radius},${lat},${lng});
    out center;
  `
  let lastError: Error | null = null
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: overpassQuery
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const locations: GameLocation[] = data.elements
        .filter((element: any) => element.tags && element.tags.name)
        .map((element: any) => ({
          id: toGameLocationId(element.id.toString()),
          name: element.tags.name,
          coordinates: {
            lat: element.lat ?? element.center.lat,
            lng: element.lon ?? element.center.lon,
          },
          type: toGameLocationTypeId('location'), // Default type, will be randomized later
          scouted: false,
        }))

      return locations
    } catch (error) {
      console.warn(`Failed to fetch from ${endpoint}:`, error)
      lastError = error as Error
    }
  }

  throw lastError || new Error('All Overpass API endpoints failed')
} 
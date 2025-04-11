import type {LocationTypeId, Pub} from '@/types'
import { locationTypes } from '../data/locationTypes'

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
]

export default async function fetchNearbyPubs(lat: number, lng: number, radius: number = 5000): Promise<Pub[]> {
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
        throw new Error(`Failed to fetch pubs: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const pubs: Pub[] = data.elements
        .filter((element: any) => element.tags && element.tags.name)
        .map((element: any) => ({
          id: element.id.toString(),
          name: element.tags.name,
          lat: element.lat ?? element.center.lat,
          lng: element.lon ?? element.center.lon,
          locationType: 'pub' // Default type, will be randomized later
        }))

      // Randomly assign location types to pubs
      const types = locationTypes.map(type => type.id)
      pubs.forEach(pub => {
        pub.locationType = types[Math.floor(Math.random() * types.length)] as LocationTypeId
      })

      return pubs
    } catch (error) {
      console.warn(`Failed to fetch from ${endpoint}:`, error)
      lastError = error as Error
      continue
    }
  }

  throw lastError || new Error('All Overpass API endpoints failed')
} 
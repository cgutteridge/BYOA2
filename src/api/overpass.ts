import {Coordinates, GameLocation, toGameLocationId, toGameLocationTypeId} from "@/types";

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
]

// This generates a bunch of secondary locations which will just give an item for free.
// they should be at least N meters from all other loactions including each other.
export async function fetchSecondaryGameLocations(coords:Coordinates, radius: number = 1000): Promise<GameLocation[]> {

  const overpassQuery = `
    [out:json][timeout:25];
    (
      way["highway"~"secondary|tertiary|residential"](around:${radius},${coords.lat},${coords.lng})->.roads;
    );
    (._;>;);
    out;
    `
  const junctionNodes = await queryOverpass(overpassQuery, parseRoads)

  // find the connecting nodes
  const locations: GameLocation[] = junctionNodes
      .map((element:OverpassElement):GameLocation => ({
        id: toGameLocationId(element.id.toString()),
        name: "Junction of "+(element?.ways || ['?error?']).join(' & '),
        coordinates: {
          lat: element.lat ?? 0,
          lng: element.lon ?? 0,
        },
        type: toGameLocationTypeId('location'), // Default type, will be randomized later
        defeatedEnemies:0,
        hasBeenVisited:false,
        scouted: false,
      }))
  return locations;
}

type OverpassElement = {
  'type': string
  tags?: Record<string, string>
  id: number
  lat?: number
  lon?: number
  nodes?: number[]
  ways?: string[]
}

function parseRoads(elements: OverpassElement[]) {
  const nodes: Record<number, OverpassElement> = {}
  elements.forEach((element) => {
    if (element.type !== 'node') {
      return
    }
    element.ways = []
    nodes[element.id] = element
  })
  elements.forEach((element) => {
        if (element.type !== 'way' || !element.nodes) {
          return
        }
        if (!element.tags?.name) {
          return;
        }

        const name = element.tags.name
        element.nodes.forEach((nodeId) => {
          const node = nodes[nodeId]
          if (!node) {
            return
          }
          if (node.ways && !node.ways?.includes(name)) {
            node.ways.push(name)
          }
        })
      }
  )
  const junctions = Object.values(nodes).filter(node => (node.ways?.length ?? 0) > 1)
  return junctions
}

export async function fetchNearbyGameLocations(coords:Coordinates, radius: number = 5000): Promise<GameLocation[]> {
  const overpassQuery = `
    [out:json][timeout:100];
    nwr["amenity"~"^(pub|bar)$"]["name"](around:${radius},${coords.lat},${coords.lng});
    out center;
  `
  return queryOverpass(overpassQuery, parseAmenities)
}


function parseAmenities(elements:OverpassElement[]) {
  const locations: GameLocation[] = elements
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
        defeatedEnemies:0,
        hasBeenVisited:false,
      }))
  return locations;
}

async function queryOverpass<T>(overpassQuery: string, parseFunction: (elements: OverpassElement[]) => T): Promise<T> {
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
      return await parseFunction(data.elements);
    } catch (error) {
      console.warn(`Failed to fetch from ${endpoint}:`, error)
      lastError = error as Error
    }
  }

  throw lastError || new Error('All Overpass API endpoints failed')
}

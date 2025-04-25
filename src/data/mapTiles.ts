interface MapTileOption {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  maxNativeZoom?: number;
  minZoom?: number;
  apiKeyRequired?: boolean;
  provider?: string;
}

const mapTiles: Record<string, MapTileOption> = {
  osm: {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    maxNativeZoom: 19
  },
  stamenWatercolor: {
    id: 'stamenWatercolor',
    name: 'Stamen Watercolor',
    url: 'https://tiles-eu.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Hosted by <a href="https://stadiamaps.com/">Stadia Maps</a>',
    maxZoom: 22,
    maxNativeZoom: 17,
    apiKeyRequired: false
  },
  pioneer: {
    id: 'pioneer',
    name: 'Pioneer (Thunderforest)',
    url: 'https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}{r}.png?apikey={apikey}',
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    apiKeyRequired: true,
    provider: 'VITE_THUNDERFOREST_API_KEY'
  },
  spinal: {
    id: 'spinal',
    name: 'Spinal Map (Thunderforest)',
    url: 'https://{s}.tile.thunderforest.com/spinal-map/{z}/{x}/{y}{r}.png?apikey={apikey}',
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    apiKeyRequired: true,
    provider: 'VITE_THUNDERFOREST_API_KEY'
  },
  outdoors: {
    id: 'outdoors',
    name: 'Outdoors (Thunderforest)',
    url: 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}{r}.png?apikey={apikey}',
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    apiKeyRequired: true,
    provider: 'VITE_THUNDERFOREST_API_KEY'
  },
  landscape: {
    id: 'landscape',
    name: 'Landscape (Thunderforest)',
    url: 'https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}{r}.png?apikey={apikey}',
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    apiKeyRequired: true,
    provider: 'VITE_THUNDERFOREST_API_KEY'
  },
  cycle: {
    id: 'cycle',
    name: 'OpenCycleMap (Thunderforest)',
    url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}{r}.png?apikey={apikey}',
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    apiKeyRequired: true,
    provider: 'VITE_THUNDERFOREST_API_KEY'
  },
  transport: {
    id: 'transport',
    name: 'Transport (Thunderforest)',
    url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}{r}.png?apikey={apikey}',
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    apiKeyRequired: true,
    provider: 'VITE_THUNDERFOREST_API_KEY'
  },
  osmHOT: {
    id: 'osmHOT',
    name: 'OSM Humanitarian',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/">HOT</a>',
    maxZoom: 22,
    maxNativeZoom: 19
  },
  stamenTerrain: {
    id: 'stamenTerrain',
    name: 'Stamen Terrain',
    url: 'https://tiles-eu.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Hosted by <a href="https://stadiamaps.com/">Stadia Maps</a>',
    maxZoom: 22,
    maxNativeZoom: 17,
    apiKeyRequired: false
  },
  stamenToner: {
    id: 'stamenToner',
    name: 'Stamen Toner',
    url: 'https://tiles-eu.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Hosted by <a href="https://stadiamaps.com/">Stadia Maps</a>',
    maxZoom: 22,
    maxNativeZoom: 17,
    apiKeyRequired: false
  },
  alidadeSmooth: {
    id: 'alidadeSmooth',
    name: 'Alidade Smooth',
    url: 'https://tiles-eu.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    maxNativeZoom: 17,
    apiKeyRequired: false
  },
  cartoDBVoyager: {
    id: 'cartoDBVoyager',
    name: 'CARTO Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 22,
    maxNativeZoom: 19
  },
  cartoDBDark: {
    id: 'cartoDBDark',
    name: 'CARTO Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 22,
    maxNativeZoom: 19
  },
  esriWorldImagery: {
    id: 'esriWorldImagery',
    name: 'ESRI World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 22,
    maxNativeZoom: 19
  }
};

export default mapTiles; 
interface MapTileOption {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  minZoom?: number;
  apiKeyRequired?: boolean;
}

const mapTiles: Record<string, MapTileOption> = {
  pioneer: {
    id: 'pioneer',
    name: 'Pioneer (Thunderforest)',
    url: 'https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}{r}.png?apikey={apikey}',
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    apiKeyRequired: true
  },
  outdoors: {
    id: 'outdoors',
    name: 'Outdoors (Thunderforest)',
    url: 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}{r}.png?apikey={apikey}',
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    apiKeyRequired: true
  },
  landscape: {
    id: 'landscape',
    name: 'Landscape (Thunderforest)',
    url: 'https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}{r}.png?apikey={apikey}',
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    apiKeyRequired: true
  },
  spinal: {
    id: 'spinal',
    name: 'Spinal Map (Thunderforest)',
    url: 'https://{s}.tile.thunderforest.com/spinal-map/{z}/{x}/{y}{r}.png?apikey={apikey}',
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    apiKeyRequired: true
  },
  cycle: {
    id: 'cycle',
    name: 'OpenCycleMap (Thunderforest)',
    url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}{r}.png?apikey={apikey}',
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    apiKeyRequired: true
  },
  transport: {
    id: 'transport',
    name: 'Transport (Thunderforest)',
    url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}{r}.png?apikey={apikey}',
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 22,
    apiKeyRequired: true
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  osmHOT: {
    id: 'osmHOT',
    name: 'OSM Humanitarian',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/">HOT</a>',
    maxZoom: 19
  },
  stamenTerrain: {
    id: 'stamenTerrain',
    name: 'Stamen Terrain',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  },
  cartoDBVoyager: {
    id: 'cartoDBVoyager',
    name: 'CARTO Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  },
  cartoDBDark: {
    id: 'cartoDBDark',
    name: 'CARTO Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  },
  esriWorldImagery: {
    id: 'esriWorldImagery',
    name: 'ESRI World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
  }
};

export default mapTiles; 
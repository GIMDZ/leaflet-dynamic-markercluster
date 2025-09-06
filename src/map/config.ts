import type { MapConfig } from '../types';

export const MAP_CONFIG: MapConfig = {
    initialView: {
        coordinates: [
            Number(import.meta.env.VITE_MAP_INITIAL_LAT) || -34.605,
            Number(import.meta.env.VITE_MAP_INITIAL_LNG) || -58.430
        ],
        zoom: Number(import.meta.env.VITE_MAP_INITIAL_ZOOM) || 18
    },
    tileProvider: {
        type: (import.meta.env.VITE_TILE_PROVIDER as 'osm' | 'cartodb-light' | 'cartodb-dark') || 'osm',
        options: {
            maxZoom: 19
        }
    },
    cluster: {
        maxClusterRadius: Number(import.meta.env.VITE_CLUSTER_MAX_RADIUS) || 120,
        showCoverageOnHover: import.meta.env.VITE_CLUSTER_SHOW_COVERAGE_ON_HOVER === 'true',
        zoomToBoundsOnClick: import.meta.env.VITE_CLUSTER_ZOOM_TO_BOUNDS_ON_CLICK !== 'false'
    },
    realtime: {
        interval: Number(import.meta.env.VITE_REALTIME_INTERVAL) || 5000,
        dataUrl: import.meta.env.VITE_REALTIME_DATA_URL || '/leaflet-dynamic-map/geojson.json'
    }
};
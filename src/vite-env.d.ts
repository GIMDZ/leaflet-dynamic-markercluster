/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TILE_PROVIDER: string
  readonly VITE_MAP_INITIAL_LAT: string
  readonly VITE_MAP_INITIAL_LNG: string
  readonly VITE_MAP_INITIAL_ZOOM: string
  readonly VITE_CLUSTER_MAX_RADIUS: string
  readonly VITE_CLUSTER_SHOW_COVERAGE_ON_HOVER: string
  readonly VITE_CLUSTER_ZOOM_TO_BOUNDS_ON_CLICK: string
  readonly VITE_REALTIME_INTERVAL: string
  readonly VITE_REALTIME_DATA_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

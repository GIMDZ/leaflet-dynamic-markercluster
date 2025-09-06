# Leaflet Dynamic MarkerCluster

Dynamic map with clustered markers using Leaflet.js

## 🆕 Version 2.0 (Modern)
- Modern ES6+ JavaScript with modules
- Vite build system
- npm package management
- Improved performance and maintainability

**Demo:** [Modern Version](https://gimdz.github.io/leaflet-dynamic-markercluster/)

## Legacy Version (v1.0)
The original version is still available in the `leaflet dynamic map/` directory.

**Demo:** [Legacy Version](https://gimdz.github.io/leaflet-dynamic-markercluster/leaflet%20dynamic%20map/)

## Development

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Environment Configuration:**
Copy the example environment file and configure your settings:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `VITE_MAPBOX_ACCESS_TOKEN`: Your Mapbox access token
- `VITE_MAP_INITIAL_LAT/LNG`: Initial map coordinates
- `VITE_MAP_INITIAL_ZOOM`: Initial zoom level
- Other cluster and realtime settings as needed

### Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run legacy version
npm run legacy
```
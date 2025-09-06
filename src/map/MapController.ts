import L, { type Map, type TileLayer } from 'leaflet';
import type { GeoJsonFeature } from '../types/index.js';
import { MAP_CONFIG } from './config.js';
import { MarkerManager } from './MarkerManager.js';

export class MapController {
    private containerId: string;
    private map: Map | null = null;
    private markerManager: MarkerManager;
    private realtime: any = null; // leaflet-realtime doesn't have types
    private lastDataHash: string = '';

    constructor(containerId: string) {
        this.containerId = containerId;
        this.markerManager = new MarkerManager();
    }

    async initialize(): Promise<void> {
        try {
            this.createMap();
            this.addTileLayer();
            await this.setupRealtime();
            this.setupResponsiveHandlers();
        } catch (error) {
            console.error('Failed to initialize map:', error);
            throw error;
        }
    }

    private createMap(): void {
        const { coordinates, zoom } = MAP_CONFIG.initialView;
        this.map = L.map(this.containerId).setView(coordinates, zoom);
    }

    private addTileLayer(): void {
        if (!this.map) return;

        const { type, options } = MAP_CONFIG.tileProvider;
        let tileLayerUrl: string;
        let tileOptions: any = {
            maxZoom: 18,
            attribution: '',
            ...options
        };

        switch (type) {
            case 'osm':
                tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
                tileOptions.attribution = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
                break;

            case 'cartodb-light':
                tileLayerUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
                tileOptions.attribution = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>';
                tileOptions.subdomains = 'abcd';
                break;

            case 'cartodb-dark':
                tileLayerUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
                tileOptions.attribution = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>';
                tileOptions.subdomains = 'abcd';
                break;

            default:
                // Fallback to OpenStreetMap
                tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
                tileOptions.attribution = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
        }

        const tileLayer: TileLayer = L.tileLayer(tileLayerUrl, tileOptions);
        tileLayer.addTo(this.map);
    }

    private async setupRealtime(): Promise<void> {
        if (!this.map) return;

        const clusterGroup = this.markerManager.createClusterGroup();

        // @ts-ignore - leaflet-realtime types not available
        this.realtime = L.realtime({
            url: MAP_CONFIG.realtime.dataUrl,
            crossOrigin: true,
            type: 'json'
        }, {
            interval: MAP_CONFIG.realtime.interval,
            getFeatureId: (feature: GeoJsonFeature) => feature.id,
            container: clusterGroup,
            pointToLayer: (feature: GeoJsonFeature, latlng: L.LatLngExpression) => {
                return this.markerManager.createMarker(feature, latlng);
            },
            onEachFeature: (feature: GeoJsonFeature, layer: L.Layer) => {
                if ('bindPopup' in layer) {
                    layer.bindPopup(feature.properties.address);
                }
            }
        });

        this.map.addLayer(this.realtime);
        this.setupRealtimeHandlers();
    }


    private setupRealtimeHandlers(): void {
        if (!this.map || !this.realtime) return;

        this.realtime.on('update', (e: any) => {
            // Create a hash of current data to detect actual changes
            const currentDataHash = this.createDataHash(e.update);

            if (currentDataHash === this.lastDataHash) {
                console.log('No data changes detected, skipping update');
                return;
            }

            this.lastDataHash = currentDataHash;

            let hasStatusChanges = false;
            const statusChanges: Array<{id: string, oldStatus: string, newStatus: string}> = [];

            Object.keys(e.update).forEach((id: string) => {
                const feature = e.update[id] as GeoJsonFeature;
                const layer = this.realtime.getLayer(id);

                if (layer) {
                    const updated = this.markerManager.updateMarker(layer, feature);
                    if (updated) {
                        hasStatusChanges = true;
                        statusChanges.push({
                            id,
                            oldStatus: (layer as any).markerStatus || 'unknown',
                            newStatus: feature.properties.status
                        });
                    }
                }
            });

            if (hasStatusChanges) {
                console.log('Status changes detected:', statusChanges);
                this.refreshClusters();
                this.map?.fitBounds(this.realtime.getBounds(), { maxZoom: 12 });
            }
        });
    }

    private createDataHash(data: any): string {
        // Create a simple hash of the data to detect changes
        const statusData = Object.keys(data).map(id =>
            `${id}:${data[id].properties.status}`
        ).sort().join(',');

        return btoa(statusData); // Simple hash using base64 encoding
    }


    private refreshClusters(): void {
        // Force cluster refresh to update cluster colors based on new marker statuses
        if (this.realtime && this.realtime.getLayers) {
            const layers = this.realtime.getLayers();
            layers.forEach((layer: any) => {
                if (layer.refreshClusters) {
                    layer.refreshClusters();
                }
            });
        }
    }


    private setupResponsiveHandlers(): void {
        const resizeHandler = (): void => {
            const mapElement = document.getElementById(this.containerId);
            if (mapElement && this.map) {
                mapElement.style.height = `${window.innerHeight * 0.75}px`;
                this.map.invalidateSize();
                this.map.setView(MAP_CONFIG.initialView.coordinates, 12);
            }
        };

        window.addEventListener('resize', resizeHandler);
        resizeHandler(); // Initial call
    }
}
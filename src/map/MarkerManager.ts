import L, {
    type LatLngExpression,
    type Marker,
    type DivIcon
} from 'leaflet';
import type { GeoJsonFeature, MarkerIcons, MarkerProperties } from '../types/index.js';
import { MAP_CONFIG } from './config.js';

// Type declaration for markerClusterGroup
declare global {
    namespace L {
        function markerClusterGroup(options?: any): any;
    }
}

export class MarkerManager {
    private icons: MarkerIcons;
    private statusChangeCallbacks: Array<(id: string, oldStatus: string, newStatus: string) => void> = [];


    constructor() {
        this.icons = this.createIcons();

    }

    private createIcons(): MarkerIcons {
        const iconConfig = {
            iconSize: [25, 41] as [number, number],
            iconAnchor: [12, 41] as [number, number],
            popupAnchor: [1, -34] as [number, number],
            shadowSize: [41, 41] as [number, number],
            shadowUrl: 'src/assets/images/marker-shadow.png'
        };

        return {
            green: new L.Icon({
                ...iconConfig,
                iconUrl: 'src/assets/images/marker-icon-green.png'
            }),
            red: new L.Icon({
                ...iconConfig,
                iconUrl: 'src/assets/images/marker-icon.png'
            }),
            default: new L.Icon({
                ...iconConfig,
                iconUrl: 'src/assets/images/marker-icon-blue.png'
            })
        };
    }

    createMarker(feature: GeoJsonFeature, latlng: LatLngExpression): Marker {
        const status = feature.properties.status;
        const icon = this.getIconByStatus(status);

        const marker = L.marker(latlng, {
            icon,
            // Store status in marker options for cluster analysis
            alt: status  // or use a custom property
        });

        // Alternative: store in a custom property
        (marker as any).markerStatus = status;

        return marker;


    }


    updateMarker(marker: Marker, feature: GeoJsonFeature): boolean {
        const newStatus = feature.properties.status;
        const currentStatus = (marker as any).markerStatus;
        const address = feature.properties.address;
        const markerId = feature.id;

        if (marker.getPopup()) {
            marker.setPopupContent(address);
        } else {
            marker.bindPopup(address);
        }

        if (currentStatus === newStatus) {
            return false; // No status change
        }

        console.log(`Marker ${markerId} status changed: ${currentStatus} → ${newStatus}`);

        // Status has changed - update icon and stored status
        const icon = this.getIconByStatus(newStatus);
        marker.setIcon(icon);
        (marker as any).markerStatus = newStatus;
        marker.options.alt = newStatus;


        // Update popup content
        this.statusChangeCallbacks.forEach(callback => {
            callback(String(markerId), currentStatus || 'unknown', newStatus);
        });


        return true; // Indicate that an update was made
    }
    onStatusChange(callback: (id: string, oldStatus: string, newStatus: string) => void): void {
        this.statusChangeCallbacks.push(callback);
    }


    private getIconByStatus(status: MarkerProperties['status']): L.Icon {
        switch (status) {
            case 'OK':
                return this.icons.green;
            case 'NOK':
                return this.icons.red;
            default:
                return this.icons.default;
        }
    }

    createClusterGroup(): any {
        return L.markerClusterGroup({
            ...MAP_CONFIG.cluster,
            iconCreateFunction: (cluster: any): DivIcon => {
                const childCount = cluster.getChildCount();
                const markers = cluster.getAllChildMarkers();

                // Check if any marker has NOK status using the stored status
                const hasErrorStatus = markers.some((marker: any) => {
                    return marker.markerStatus === 'NOK' || marker.options.alt === 'NOK';
                });

                const clusterClass = hasErrorStatus
                    ? 'marker-cluster marker-cluster-large'
                    : 'marker-cluster marker-cluster-small';

                return new L.DivIcon({
                    html: `<div><span>${childCount}</span></div>`,
                    className: clusterClass,
                    iconSize: new L.Point(40, 40)
                });
            }
        });
    }

}
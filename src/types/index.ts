import type { LatLngExpression, Icon } from 'leaflet';

export interface MarkerStatus {
    OK: 'OK';
    NOK: 'NOK';
}

export interface MarkerProperties {
    address: string;
    status: keyof MarkerStatus;
    timestamp?: string;
    priority?: number;
}

export interface GeoJsonFeature {
    type: 'Feature';
    id: string | number;
    properties: MarkerProperties;
    geometry: {
        type: 'Point';
        coordinates: [number, number]; // [lng, lat]
    };
}

export interface MapConfig {
    initialView: {
        coordinates: LatLngExpression;
        zoom: number;
    };
    tileProvider: {
        type: 'osm' | 'cartodb-light' | 'cartodb-dark';
        options?: {
            attribution?: string;
            maxZoom?: number;
            subdomains?: string[];
        };
    };
    cluster: {
        maxClusterRadius: number;
        showCoverageOnHover: boolean;
        zoomToBoundsOnClick: boolean;
    };
    realtime: {
        interval: number;
        dataUrl: string;
    };
}

export interface MarkerIcons {
    green: Icon;
    red: Icon;
    default: Icon;
}
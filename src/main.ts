// Import Leaflet first
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Then import markercluster plugin
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import 'leaflet-realtime';


// Make sure L is available globally for the plugin
window.L = L;

import { MapController } from './map/MapController.js';

const initializeApp = async (): Promise<void> => {
    try {
        const mapController = new MapController('mapid');
        await mapController.initialize();

        // Set current year in footer
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear().toString();
        }
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
};

document.addEventListener('DOMContentLoaded', initializeApp);
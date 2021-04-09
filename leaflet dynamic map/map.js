function dibujarmapa() {
    var mymap = L.map('mapid').setView([-34.605, -58.430], 18);

    L.tileLayer(
        'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: '' +
                '' +
                '',
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(mymap);

    var redIcon = new L.Icon({
        iconUrl: 'plugins/leaflet/images/marker-icon.png',
        shadowUrl: 'plugins/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var greenIcon = new L.Icon({
        iconUrl: 'plugins/leaflet/images/marker-icon-green.png',
        shadowUrl: 'plugins/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var clusterGroup = L.markerClusterGroup({
        maxClusterRadius: 120,
        iconCreateFunction: function (cluster) {
            var childCount = cluster.getChildCount();
            var markers = cluster.getAllChildMarkers();
            var group_status = "OK";
            

            markers.forEach(element => {
                console.log(element.feature.properties.status);
                if (element.feature.properties.status === "NOK") {
                    group_status = "NOK";
                }
            });
            var c = ' marker-cluster-';
            if (group_status != "NOK") {
                c += 'small';
            } else {
                c += 'large';
            }
            return new L.DivIcon({
                html: '<div><span>' + childCount + '</span></div>',
                className: 'marker-cluster' + c,
                iconSize: new L.Point(40, 40)
            });
        },

    });

    var realtime = L.realtime({
        url: 'geojson.json',
        crossOrigin: true,
        type: 'json'
    }, {
        interval: 5 * 1000,
        getFeatureId: function (feature) {
            return feature.id;
        },
        container: clusterGroup,
        pointToLayer: function (feature, latlng) {
            switch (feature.properties.status) {
                case 'OK':
                    return L.marker(latlng, {
                        icon: greenIcon
                    });
                case 'NOK':
                    return L.marker(latlng, {
                        icon: redIcon
                    });
                default:
                    return L.marker(latlng);
            }
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.address);
        }
    });

    mymap.addLayer(realtime);

    realtime.on('update', function (e) {
        mymap.fitBounds(realtime.getBounds(), {
            maxZoom: 12
        });
        Object.keys(e.update).forEach(function (id) {
            var feature = e.update[id];
            var status = feature.properties.status;
            var address = feature.properties.address;
            if (status === "OK") {
                this.getLayer(id).setIcon(greenIcon);
            } else {
                this.getLayer(id).setIcon(redIcon);
            }
            this.getLayer(id).bindPopup(address);
        }.bind(this));
    });

    // Responsive map
    $(window).on("resize", function () {
    	$("#mapid").height($(window).height() * 0.75);
    	mymap.invalidateSize();
    	mymap.setView([-34.605, -58.430], 12);
    }).trigger("resize");

}
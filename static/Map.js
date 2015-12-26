function initMapWithMarkers() {
            var ParisGeo = new google.maps.LatLng(48.8567, 2.3508);
            var LondonGeo = new google.maps.LatLng(51.5072, -0.1275);
            var BerlinGeo = new google.maps.LatLng(52.5167, 13.3833);
            var AmsterdamGeo = new google.maps.LatLng(52.3667, 4.9000);

            var mapProps = {
                center: ParisGeo,
                zoom: 5,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("googleMap_6"), mapProps);

            var ParisMarker = new google.maps.Marker({
                position: ParisGeo
            });
            ParisMarker.setMap(map);

            var LondonMarker = new google.maps.Marker({
                position: LondonGeo,
                animation: google.maps.Animation.BOUNCE
            });
            LondonMarker.setMap(map);

            var BerlinMarker = new google.maps.Marker({
                position: BerlinGeo,
                animation: google.maps.Animation.DROP
            });
            BerlinMarker.setMap(map);

            var AmsterdamMarker = new google.maps.Marker({
                position: AmsterdamGeo,
                draggable: true,
                icon:'gmaps.png'
            });
            AmsterdamMarker.setMap(map);
        }
        google.maps.event.addDomListener(window, 'load', initMapWithMarkers);


function initInfoMap() {
            var LondonGeo = new google.maps.LatLng(51.5072, -0.1275);
            var mapProps = {
                center: LondonGeo,
                zoom: 7,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("googleMap_8"), mapProps);

            var marker = new google.maps.Marker({
               position: LondonGeo,
               draggable: true
            });
            marker.setMap(map);

            var infoWindow = new google.maps.InfoWindow({
               content: '<strong>London</strong> is the capital of <span style="color: red">Great Britain</span>'
                        + '</br><em>Latitude</em> : ' + LondonGeo.lat()
                        + '</br><em>Longitude</em> : ' + LondonGeo.lng()
                        + '</br><em>Zoom level</em> : ' + map.getZoom()
            });
            infoWindow.open(map, marker);
        }
        google.maps.event.addDomListener(window, 'load', initInfoMap);

        var map_clicked = false;
        function initEventsMap() {
            var centerGeo = new google.maps.LatLng(48.8567, 2.3508);
            var zoomLevelInfoGeo = new google.maps.LatLng(48.5000, 2.3508);
            var mapProps = {
                center: centerGeo,
                zoom: 5,
                mapTypeId: google.maps.MapTypeId.TERRAIN
            };
            var map = new google.maps.Map(document.getElementById("googleMap_9"), mapProps);

            var marker = new google.maps.Marker({
                position: centerGeo,
                // this content will displayed at hovering over the marker
                title: 'Click to zoom'
            });
            marker.setMap(map);

            // Zoom the map to 9th level when clicking on marker
            // We hide the tool tip after 3 seconds
            google.maps.event.addListener(marker, 'click', function() {
                map.setZoom(9);
                map.setCenter(marker.getPosition());
                var infoWindow = new google.maps.InfoWindow({
                   content: "The map was zoomed to ninth level"
                });
                infoWindow.open(map, marker);
                window.setTimeout(function() {
                    infoWindow.open();
              }, 3000);
            });

            // After 4 seconds delay we are centering the map according the initial position
            // Thus, pan back to the marker
            google.maps.event.addListener(map, 'center_changed', function() {
              window.setTimeout(function() {
                    map.panTo(marker.getPosition());
              }, 4000);
            });

            // We display a Info window when the map is clicked
            // and hide it when the map is clicking again
            var alertWindow = new google.maps.InfoWindow();
            alertWindow.setContent('You can change the zoom level');
            alertWindow.setPosition(zoomLevelInfoGeo);
            google.maps.event.addDomListener(map, 'click', function() {
                map_clicked = !map_clicked;
                if (map_clicked) {
                    alertWindow.open(map);
                } else {
                    alertWindow.open();
                }
            });

            map.addListener('zoom_changed', function() {
                if (map_clicked) {
                    alertWindow.setContent('Zoom level: ' + map.getZoom());
                }
            });
        }
        google.maps.event.addDomListener(window, 'load', initEventsMap);
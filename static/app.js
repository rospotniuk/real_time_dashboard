var socket = io.connect('http://' + document.domain + ':' + location.port + '/app');

socket.on('connect_to_server', function(msg) {
    console.log(msg);
});

socket.on('graph_data', function(msg) {
    //console.log(msg);
    line_chart.tick(msg);
    bar_chart.update(msg)
});

socket.on('pie_graph_data', function(msg) {
    console.log(msg);
    //pie_chart.tick(msg)
});

socket.on('map_data', function(msg) {
    //console.log(msg);
    addMarker(msg);
    progress_bar.update();
    pie_chart.update();
    sort_bar_chart.update()
});

setInterval(function() {
    socket.emit('message');
}, 1000);

var updateMarkers = function() {
    socket.emit('message3');
    var rand = Math.round(Math.random() * (3000 - 500)) + 500; // generate new time (between 3sec and 500 msec)
    setTimeout(updateMarkers, rand);
};
updateMarkers();



var line_chart = new LineChart().selector('#line_chart');
line_chart.init();

var bar_chart = new BarChart().selector('#balance');
bar_chart.init();

var globe = new RotatingGlobe().selector('#globe');
globe.init();

var progress_bar = new CircularProgressBar().selector('#progress_radial');
progress_bar.init();

var pie_chart = new PieChart().selector('#pie_chart');
pie_chart.init();

var sort_bar_chart = new SortedBarChart().selector('#sort_bar_chart');
sort_bar_chart.init();

/*
Google map
 */
var markers = [],
    markers_data = [];
var max_amount = 20;
var map;

function initMap () {
    var mapProps = {
        center: new google.maps.LatLng(0, 0),
        zoom: 1,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("google_map"), mapProps);
}

function addMarker (data) {
    var mark = {
        lat: parseFloat(data["CapitalLatitude"]),
        lon: parseFloat(data["CapitalLongitude"]),
        capital: data["CapitalName"],
        continent: data["ContinentName"],
        country: data["CountryName"],
        population: +data["CapitalPopulation"]
    };

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(mark.lat, mark.lon),
        title: 'Click to display tool tip',
        animation: google.maps.Animation.DROP
    });
    marker.setMap(map);

    markers.push(marker);
    markers_data.push(mark);
    if (markers.length > max_amount) {
        markers.shift().setMap(null);
        markers_data.shift()
    }

    google.maps.event.addListener(marker, 'click', function () {
        var infoWindow = new google.maps.InfoWindow({
            content: '<strong>' + mark.capital + '</br>' + mark.country + '</strong>'
        });
        infoWindow.open(map, marker);
        window.setTimeout(function () {
            infoWindow.open();
        }, 5000);
    });
}

google.maps.event.addDomListener(window, 'load', initMap);



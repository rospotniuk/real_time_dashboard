var socket = io.connect('http://' + document.domain + ':' + location.port + '/app');

socket.on('check_connection', function(msg) {
    console.log(msg);
});

socket.on('graph_data', function(msg) {
    line_chart.tick(msg);
    bar_chart.update(msg)
});

socket.on('map_data', function(msg) {
    addMarker(msg);
    progress_bar.update();
    pie_chart.update();
    sort_bar_chart.update()
});

setInterval(function() {
    socket.emit('message');
}, 1000);

(function updateMarkers() {
    socket.emit('google_map');
    var rand = Math.round(Math.random() * 3000) + 1000; // generate new time (between 1 sec and 4 sec)
    setTimeout(updateMarkers, rand);
}());

socket.on('input', function(msg) {
    emit_word_cloud.update(msg.words)
});
$('form#emit').submit(function(event) {
    socket.emit('input_event', {data: $('#emit_data').val()});
    return false;
});

var broadcast_words = [];
socket.on('input_broadcast', function(msg) {
    $('#last_word').text(msg.data);
    if (broadcast_words.length < 20) {
        broadcast_words.push({'text': msg.data, 'size': Math.round(300/msg.data.length)})
    } else {
        broadcast_words.shift();
        broadcast_words.push({'text': msg.data, 'size': Math.round(300/msg.data.length)})
    }
    broadcast_word_cloud.update(broadcast_words)
});
$('form#broadcast').submit(function(event) {
    socket.emit('input_broadcast_event', {data: $('#broadcast_data').val()});
    return false;
});


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

var emit_word_cloud = new WordCloud().selector("#emit_world_cloud");
emit_word_cloud.init();

var broadcast_word_cloud = new WordCloud('broadcast').selector("#broadcast_world_cloud");
broadcast_word_cloud.init();

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



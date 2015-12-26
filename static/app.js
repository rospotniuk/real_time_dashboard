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

var id = setInterval(function() {
    socket.emit('message');
}, 1000);


var line_chart = new LineChart().selector('#line_chart');
line_chart.init();

var bar_chart = new BarChart().selector('#bar_chart');
bar_chart.init();
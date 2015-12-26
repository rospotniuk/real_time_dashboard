var PieChart = function (data) {
    var self = this;

    /* Sets selector of block where chart would be placed */
    this.selector = function (s) {
        self._selector = s;
        return self;
    };
    var colors = d3.scale.category10();
    var innerRadius = 100,
        outerRadius = 0,
        height = 400;

    this.init = function () {
        var width = parseInt($(self._selector).css('width'));
        var pie = d3.layout.pie()
            .value(function(d) { return d.apples; })
            .sort(null);
     
        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        self.svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        self.path = self.svg.selectAll("svg").data(pie([1,1,1,1,1]))
            .enter().append("path")
            .attr("fill", "white")
            .attr("d", arc)
            .each(function(d) { this._current = d; }); // store the initial values

        $(svg).bind("monitor", {svg:svg, arc:arc, pie:pie}, worker);
        $(svg).trigger("monitor");

function worker(event) {
    var svg = event.data.svg;
    var arc  = event.data.arc;
    var pie  = event.data.pie
    
    var jobs_counts = getRandomCounts();
    var jobs_colors = ["green", "yellow", "red", "blue", "cyan"];    
    path = path.data(pie(jobs_counts))
               .attr("fill", function(d,i) {return jobs_colors[i]})
    path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
                                                                                   
    setTimeout(function(){$(svg).trigger("monitor")}, 1000)
}
                        
// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}

function getRandomCounts() {
    var arr = [];
    for (var i=0;i<5;i++) {
       arr.push(Math.floor(Math.random()*10)+1);
    }
    console.log(arr);
    return (arr);
}        

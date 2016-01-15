var LineChart = function () {
    var self = this;
    var format_time = d3.time.format("%H:%M:%S");       // parse date
    var margin = {top: 30, right: 15, bottom: 20, left: 50};

    /* Sets selector of block where chart would be placed */
    this.selector = function (s) {
        self._selector = s;
        return self;
    };

    self.data_collector = [];

    this.init = function () {
        var height = 400 - margin.top - margin.bottom;
        var width = parseInt($(self._selector).css('width')) - margin.left - margin.right;

        self.x = d3.time.scale().range([0, width]);
        self.y = d3.scale.linear().domain([0, 100]).range([height, 0]);
        self.xAxis = d3.svg.axis()
            .scale(self.x)
            .ticks(8)
            .tickFormat(d3.time.format("%H:%M:%S"))
            .orient("bottom");

        self.yAxis = d3.svg.axis()
            .scale(self.y)
            .orient("left");

        self.area = d3.svg.area()
            .interpolate("monotone")
            .x(function (d) { return self.x(format_time.parse(d.time)); })
            .y0(height)
            .y1(function (d) { return self.y(d.value); });

        self.svg = d3.select(self._selector)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        self.axisX = self.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(self.xAxis);

        self.axisY = self.svg.append("g")
            .attr("class", "y axis")
            .call(self.yAxis);

        // Add the title
        self.title = self.svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("");

        self.path = self.svg.append("path")
            .datum(self.data_collector)
            .attr("class", "area")
            .attr("d", self.area);

        self.div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    };

    this.tick = function (data) {
        var limit_values = 100,
            duration = 1000;
        var now = format_time.parse(data.time);
        self.data_collector.push(data);

        // update domain
        self.x.domain([now - limit_values * duration, now]);
        self.y.domain([0, d3.max(self.data_collector, function(d) { return d.value; })]);

        self.axisY.transition()
            .duration(duration)
            .ease("sin-in-out")
            .call(self.yAxis);

        // redraw path
        self.path.attr('transform', null)
            .attr("d", self.area)
            .transition()
            .duration(duration)
            .ease('linear');

        self.div.transition()
            .duration(1500)
            .style("opacity", 0);

        self.svg.selectAll(".dot").remove();
        self.svg.selectAll("dot")
            .data(self.data_collector)
            .enter().append("circle")
            .attr("class", "dot")
            .attr('cx', function(d) { return self.x(format_time.parse(d.time)); })
            .attr('cy', function (d) { return self.y(d.value); })
            .attr('r', 4)
            .style("fill", "white")
			.style("stroke", "steelblue")
			.style("stroke-width", "2px")
			.on("mouseover", function(d) {
                d3.select(this)
                    .style("fill", "steelblue")
                    .style("stroke", "white");
				self.div.transition()
					.duration(200)
					.style("opacity", .8);
				self.div.html(d.value)
					.style("left", (d3.event.pageX - 25) + "px")
					.style("top", (d3.event.pageY - 25) + "px");
			})
			.on("mouseout", function(d) {
				self.div.transition()
					.duration(100)
					.style("opacity", 0);
			});

        // shift axis left
        self.axisX.transition()
            .duration(duration)
            .ease("linear")
            .call(self.xAxis);

        self.title.datum(data)
            .text(function (d) {
                var options = {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    weekday: 'long'
                };
                var now = new Date(d.date + ' ' + d.time);
                if (now.getHours() !== 0 &&
                    Math.round((now - new Date(now.getFullYear(), now.getMonth(), now.getDate()))/1000) <= limit_values
                ) {
                    var yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate()-1);
                }
                date = yesterday
                     ? yesterday.toLocaleString("en-US", options) + "and" + new Date(d.date).toLocaleString("en-US", options)
                     : new Date(d.date).toLocaleString("en-US", options);
                return "Data is displayed for " + date;
            });

        if (self.data_collector.length > limit_values) {
            // remove oldest data
            self.data_collector.shift();
        }
    }
};
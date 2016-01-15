var SortedBarChart = function () {
    var max_population = 5*Math.pow(10, 7);
    var formatInteger = d3.format(".1f"),
        formatMillions = function(d) { return formatInteger(d / 1e6) + "M"; };

    var self = this;

    var margin = margin = {top: 0, right: 10, bottom: 0, left: 10},
        height = 380 - margin.top - margin.bottom;

    /* Sets selector of block where chart would be placed */
    this.selector = function (s) {
        self._selector = s;
        return self;
    };

    this.init = function (countries_amount) {
        self.amount = countries_amount ? (countries_amount > 15 | countries_amount < 5) ? 10 : countries_amount : 10;
        self.width = parseInt($(self._selector).css('width')) - margin.left - margin.right;

        self.index = d3.range(self.amount);
        self.data = new Array(self.amount).fill({pop: 0});

        self.x = d3.scale.linear()
            .domain([0, max_population])
            .range([0, self.width]);

        self.y = d3.scale.ordinal()
            .domain(self.index)
            .rangeRoundBands([0, height], .15);

        self.svg = d3.select(self._selector).append("svg")
            .attr("width", self.width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        self.div = d3.select("body").append("div")
            .attr("class", "sorted_tooltip")
            .style("opacity", 0);
        self.replaced_index = 0;
    };

    this.update = function () {
        var n = markers_data.length;
        if (n >= self.amount) {
            self.replaced_index = ++self.replaced_index % self.amount;
        } else{
            for (var i in self.data) {
                if (self.data[i].pop === 0) {
                    self.replaced_index = i;
                    break;
                }
            }
        }
        self.data[self.replaced_index] = {
            pop: markers_data[n-1]["population"],
            name: markers_data[n-1]["capital"],
            country: markers_data[n-1]["country"],
            fill: "lightsteelblue",
            stroke: "steelblue"
        };

        self.div.transition()
            .duration(2000)
            .style("opacity", 0);

        self.svg.selectAll(".bar").remove();
        var bar = self.svg.selectAll(".bar")
            .data(self.data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d, i) { return "translate(0," + self.y(i) + ")"; });

        bar.append("rect")
            .attr("height", self.y.rangeBand())
            .attr("x", function(d) { return self.width/2 - self.x(d["pop"])/2; })
            .attr("width", function(d) { return self.x(d["pop"]); })
            .attr("fill", function(d) { return d["fill"]; })
            .attr("stroke", function(d) { return d["stroke"]; })
            .attr("stroke-width", 2)
            .on("mouseover", function (d) {
                d.fill = "lightsalmon";
                d.stroke = "darksalmon";
                d3.select(this).transition().duration(250)
                    .attr("fill", function(d) { return d["fill"]; })
                    .attr("stroke", function(d) { return d["stroke"]; });
                self.div.transition()
					.duration(200)
					.style("opacity", .8);
				self.div.html(d.country + "</br>" + d.name + ": " + formatMillions(d.pop))
					.style("left", (d3.event.pageX - 25) + "px")
					.style("top", (d3.event.pageY - 25) + "px");
            })
            .on("mouseout", function (d, i) {
                d.fill = "lightsteelblue";
                d.stroke = "steelblue";
                d3.select(this).transition().duration(250)
                    .attr("fill", function(d) { return d["fill"]; })
                    .attr("stroke", function(d) { return d["stroke"]; });
                self.div.transition()
					.duration(100)
					.style("opacity", 0);
            });

        bar.append("text")
            .attr("text-anchor", "begin")
            .attr("x", function(d) { return self.width/2 - self.x(d["pop"])/2 + 5; })
            .attr("y", self.y.rangeBand() / 2)
            .attr("dy", ".35em")
            .text(function(d) { return d["name"]; });

        if (n > 1) {
            self.index.sort(function(a, b) { return self.data[b]["pop"] - self.data[a]["pop"]; });
        }
        self.y.domain(self.index);

        bar.transition()
            .duration(750)
            .delay(function(d, i) { return i * 50; })
            .attr("transform", function(d, i) {
                var y = self.y(i);
                if (d.y !== y) {
                    d.fill = "lightsteelblue";
                    d.stroke = "steelblue";
                }
                d.y = y;
                d3.select(this).select("rect")
                    .transition().duration(450)
                    .attr("fill", function(d) { return d["fill"]; })
                    .attr("stroke", function(d) { return d["stroke"]; });
                return "translate(0," + d.y + ")";
            });
    }
};

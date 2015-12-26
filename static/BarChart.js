var BarChart = function () {
    var self = this;
    var margin = {top: 50, right: 0, bottom: 20, left: 20};
    var height = 400 - margin.top - margin.bottom;
    var colors = d3.scale.ordinal()
        .range(["#9ACD32", "#ff8c00"]);

    /* Sets selector of block where chart would be placed */
    this.selector = function (s) {
        self._selector = s;
        return self;
    };

    self.data_counter = [0,    // corresponds to even get numbers
                         0];   // corresponds to odd get numbers

    this.init = function () {
        var width = parseInt($(self._selector).css('width')) - margin.left - margin.right;

        x = d3.scale.ordinal().rangeRoundBands([0, width], .2);
        x.domain([0,1]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(2)
            .tickFormat(function (d) {
                var mapper = { 0: "Even numbers", 1: "Odd numbers" };
                return mapper[d]
            })
            .orient("bottom");

        self.svg = d3.select(self._selector).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        self.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        self.svg.selectAll("bar")
            .data(self.data_counter)
            .enter().append("rect")
            .attr("x", function(d, i) { return x(i); })
            .attr("width", x.rangeBand())
            .attr("y", 0)
            .attr("height", 0)
            .attr("fill", function(d, i) { return colors(i); });

        self.svg.selectAll(".bar_amount")
            .data(self.data_counter)
            .enter()
            .append("text")
            .attr("class", "bar_amount")
            .attr("text-anchor", "middle")
            .style("font-weight", "bold")
            .attr("x", function(d, i) { return x(i) + x.rangeBand()/2; })
            .attr("y", function(d) { return -30; })
            .text("");

        self.svg.selectAll(".bar_percent")
            .data(self.data_counter)
            .enter()
            .append("text")
            .attr("class", "bar_percent")
            .attr("text-anchor", "middle")
            .attr("x", function(d, i) { return x(i) + x.rangeBand()/2; })
            .attr("y", function(d) { return -15; })
            .text("");
    };

    this.update = function (data) {
        if (data.value % 2 === 0) {
            self.data_counter[0] = ++self.data_counter[0];
        } else {
            self.data_counter[1] = ++self.data_counter[1];
        }
        var total = self.data_counter.reduce(function(a, b){ return a+b; });

        self.svg
            .selectAll("rect")
            .data(self.data_counter)
            .transition()
            .duration(500)
            .attr("y", function(d) { return height * (1-Math.round(d/total*1e3)/1e3); })
            .attr("height", function(d) { return height * (Math.round(d/total*1e3)/1e3); });

        self.svg.selectAll(".bar_amount")
            .data(self.data_counter)
            .text(function(d) { return "" + d; });

        self.svg.selectAll(".bar_percent")
            .data(self.data_counter)
            .text(function(d) {
                return "" + Math.round(d/total*1e5)/1e3 + "%";
            });
    }
};

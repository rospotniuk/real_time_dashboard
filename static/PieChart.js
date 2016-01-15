var PieChart = function () {
    var self = this;

    /* Sets selector of block where chart would be placed */
    this.selector = function (s) {
        self._selector = s;
        return self;
    };
    var colors = d3.scale.category10();

    this.init = function () {
        var width = parseInt($(self._selector).css('width')),
            height = 225;
        self.radius = Math.min(width, height) / 2;

        self.pie = d3.layout.pie()
            .value(function (d) { return d.value });

        self.arc = d3.svg.arc()
            .innerRadius(0)
            .outerRadius(self.radius * 0.8);

        self.outerArc = d3.svg.arc()
            .innerRadius(self.radius * 0.85)
            .outerRadius(self.radius * 0.85);

        self.hoverArc = d3.svg.arc()
            .innerRadius(0)
            .outerRadius(self.radius * 0.8 + 4);

        self.svg = d3.select(self._selector).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        self.svg.append("g")
	        .attr("class", "slices");
        self.svg.append("g")
	        .attr("class", "labels");
        self.svg.append("g")
	        .attr("class", "values");
        self.svg.append("g")
	        .attr("class", "lines");
    };
    
    this.update = function () {
        var amount = markers_data.length;
        var data = {};
        for (var i=0; i < amount; i++) {
            var key = markers_data[i].continent;
            if (key in data) {
                data[key] = ++data[key];
            } else {
                data[key] = 1;
            }
        }
        //var values = Object.keys(data).map(function(key) { return data[key]; });
        var pieData = d3.entries(data);

        var slice = self.svg.select(".slices").selectAll("path.slice").data(self.pie(pieData));
        var pieText = self.svg.select(".values").selectAll("text").data(self.pie(pieData));
        var labelText = self.svg.select(".labels").selectAll("text").data(self.pie(pieData));

        /* SLICES */
        slice.enter()
            .insert("path")
            .style("fill", function(d, i) { return colors(i); })
            .attr("class", "slice")
            .attr("d", self.arc)
            .each(function(d) { this._current = d; })
            .on("mouseover", function (d) {
                d3.select(this).transition().duration(200)
                    .attr("d", self.hoverArc)
                    .style("opacity", .9)
                    .style('stroke', 'white')
                    .style('stroke-width', 2);
            })
            .on("mouseout", function (d, i) {
                d3.select(this).transition().duration(200)
                    .attr("d", self.arc)
                    .style("opacity", 1)
                    .style('stroke-width', 0);
            });
        slice.transition().duration(750)
            .attrTween("d", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    return self.arc(interpolate(t));
                };
		    });
        slice.exit().remove();

        /* VALUES ON PIE SLICES */
        pieText.enter()
            .append("text")
            .attr("transform", function(d) {
                d.innerRadius = 0;
                d.outerRadius = self.radius;
                return "translate(" + self.arc.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .attr("fill", "#FFFFFF")
            .attr("font-size", "16px")
            .text(function(d) { return d.data.value; });
        pieText.text(function(d) { return d.data.value; });
        pieText.transition().duration(750).attr("transform", function(d) {
            d.innerRadius = 0;
            d.outerRadius = self.radius;
            return "translate(" + self.arc.centroid(d) + ")";
        });
        pieText.exit().remove();

        /* CONTINENTS NAMES */
        labelText.enter()
            .append("text")
            .attr("dy", ".35em")
            .attr("transform", function(d) {
                return "translate(" + self.outerArc.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .attr("fill", "#000000")
            .attr("font-weight", "bold")
            .attr("font-size", "12px")
            .text(function(d) { return d.data.key; });
        labelText.text(function(d) { return d.data.key; });
        labelText.transition().duration(750).attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return "translate("+ self.outerArc.centroid(d2) +")";
			};
		})
		.styleTween("text-anchor", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
                if (midAngle(d2) === Math.PI | midAngle(d2) === 2*Math.PI) {
                    return "middle";
                } else {
                    return midAngle(d2) < Math.PI ? "start" : "end";
                }
			};
		});
        labelText.exit().remove();
	};

    function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}
};
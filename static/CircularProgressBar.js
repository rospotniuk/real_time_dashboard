var CircularProgressBar = function () {
    var self = this;
    var colors =  d3.scale.ordinal()
        .domain(["elapsed", "remaining"])
        .range(["#4682B4", "#ADD8E6"]);
    var gradient = generateColor('#008000', 'FFFF00', 100);

    /* Sets selector of block where chart would be placed */
    this.selector = function (s) {
        self._selector = s;
        return self;
    };

    var all_countries = 245;
    var per_minute = 0,
        counter = 0,
        total = 0;

    this.init = function () {
        var width = parseInt($(self._selector).css('width')),
            height = 320,
            innerHeight = 180;
        self.innerRadius = Math.min(width, innerHeight) / 2;
        self.outerRadius = Math.min(width, height - 70) / 2;
        self.legend = height;

        self.elapsed = 0;
        self.range = 60;

        self.arc = d3.svg.arc()
            .innerRadius(self.innerRadius)
            .outerRadius(self.outerRadius);

        self.pie = d3.layout.pie()
            .sort(null)
            .value(function (d) { return d.value });

        self.svg = d3.select(self._selector).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width/2 + "," + (height-70)/2 + ")");

        self.innerProgress = self.svg.append("g")
            .attr("class", "inner")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        self.circle = self.innerProgress.append("circle")
            .attr("r", self.innerRadius-2)
            .style("fill", "FFFF00")
            .attr("clip-path", "url(#clip)");

        var defs = self.innerProgress.append("defs");
        self.clip = defs.append("clipPath")
            .attr("id", "clip")
			.append("rect")
            .attr("x", "-" + self.innerRadius)
            .attr("y", self.innerRadius)
			.attr("width", 2*self.innerRadius)
            .attr("height", 0);

        self.svg.append("text")
            .attr("x", -50)
            .attr("y", height/2 - 15)
            .attr("text-anchor", "middle")
            .attr("font-size", "14")
            .attr("font-weight", "bold")
            .style("fill", "black")
            .text("Per minute");

        self.svg.append("text")
            .attr("x", 50)
            .attr("y", height/2 - 15)
            .attr("text-anchor", "middle")
            .attr("font-size", "14")
            .attr("font-weight", "bold")
            .style("fill", "black")
            .text("Total");

        self.svg.append("rect")
            .attr("x", -100)
            .attr("width", 100)
            .attr("y", height/2 - 10)
            .attr("height", 40)
            .attr("fill", "#F8F8FF")
            .attr("stroke", "#D3D3D3")
            .attr("stroke-weight", 2);

        self.text_per_minute = self.svg
            .append("text")
            .attr("class", "text_per_minute")
            .attr("x", -50)
            .attr("y", height/2+18)
            .attr("text-anchor", "middle")
            .attr("font-size", "24")
            .attr("font-weight", "bold")
            .style("fill", "#FF6347")
            .text("100");

        self.value_total = self.svg.append("rect")
            .attr("x", 0)
            .attr("width", 100)
            .attr("y", height/2 - 10)
            .attr("height", 40)
            .attr("fill", "#F8F8FF")
            .attr("stroke", "#D3D3D3")
            .attr("stroke-weight", 2);

        self.text_total = self.svg
            .append("text")
            .attr("class", "text_total")
            .attr("x", 50)
            .attr("y", height/2+18)
            .attr("text-anchor", "middle")
            .attr("font-size", "24")
            .attr("font-weight", "bold")
            .style("fill", "#FF6347")
            .text("100");

        setInterval(function() { tick(); }, 1000);
    };

    this.update = function () {
        counter ++;
        per_minute ++;
        total ++;
        if (counter == all_countries) { counter = 0; }
        var k = counter / all_countries;
        var text = Math.round(k*1e4)/1e2 + "%";

        var t0, t1 = k * 2 * Math.PI;
        // Solve for theta numerically
        if (k > 0 && k < 1) {
            t1 = Math.pow(12 * k * Math.PI, 1 / 3);
            for (var i = 0; i < 10; ++i) {
                t0 = t1;
                t1 = (Math.sin(t0) - t0 * Math.cos(t0) + 2 * k * Math.PI) / (1 - Math.cos(t0));
            }
            var a = (1 - Math.cos(t1 / 2)) / 2;
        }

        var h = 2 * self.innerRadius * a,
            y = self.innerRadius - h;

        self.clip
            .transition()
            .duration(300)
            .attr("y", y)
			.attr("height", h);

        self.circle.style("fill", function(d) { return "#" + gradient[Math.floor(k*100)]; });

        self.innerProgress.selectAll("text").remove();
        self.innerProgress.append("text")
            .attr("class", "value")
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .attr("font-size", "30")
            .attr("stroke", "white")
            .attr("font-weight", "bold")
            .style("fill", "#000080")
            .style("fill-opacity", .7)
            .text(text);

        self.text_per_minute.text(per_minute);
        self.text_total.text(total);
    };

    function tick() {
        var data = {
            "elapsed": self.elapsed,
            "remaining": self.range - self.elapsed
        };

        var slices = d3.entries(data);
        var path = self.svg.selectAll("path").data(self.pie(slices));
        path.enter()
            .append("path")
            .attr("class", function(d, i) { return i==0 ? "elapsed" : "remaining" ; })
            .attr("fill", function(d, i) { return colors(i); } )
            .attr("d", self.arc)
            .each(function(d) { this._current = d; });
        path.transition()
            .duration(750)
            .attrTween("d", arcTween);

        self.svg.selectAll("text.seconds").remove();
        self.svg.append("text")
            .attr("class", "seconds")
            .attr("x", 0)
            .attr("y", self.legend / 2 - 47)
            .attr("fill", "#FFFFFF")
            .attr("stroke", "#000080")
            .style("text-anchor", "middle")
            .attr("font-weight", "bold")
            .style("font-size", "24px")
            .text(self.elapsed + " sec");

        path.exit().remove();
        if (self.elapsed < self.range) {
            self.elapsed ++;
        } else {
            self.elapsed = 0;
            per_minute = 0;
        }
    }

    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return self.arc(i(t));
        };
    }

    // GRADIENT COLORS GENERATOR
    function hex(c) {
        var s = "0123456789abcdef";
        var i = parseInt(c);
        if (i == 0 || isNaN(c)) { return "00"; }
        i = Math.round(Math.min(Math.max(0, i), 255));
        return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
    }

    /* Convert an RGB triplet to a hex string */
    function convertToHex(rgb) {
      return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
    }

    /* Remove '#' in color hex string */
    function trim(s) {
        return (s.charAt(0) == '#') ? s.substring(1, 7) : s
    }

    /* Convert a hex string to an RGB triplet */
    function convertToRGB (hex) {
      var color = [];
      color[0] = parseInt((trim(hex)).substring(0, 2), 16);
      color[1] = parseInt((trim(hex)).substring(2, 4), 16);
      color[2] = parseInt((trim(hex)).substring(4, 6), 16);
      return color;
    }

    function generateColor(colorStart, colorEnd, colorCount){
        // The beginning of your gradient
        var start = convertToRGB(colorStart);
        // The end of your gradient
        var end   = convertToRGB(colorEnd);
        // The number of colors to compute
        var len = colorCount;
        //Alpha blending amount
        var alpha = 0.0;
        var colors = {};
        for (var i = 0; i < len; i++) {
            var c = [];
            alpha += (1.0/len);
            c[0] = start[0] * alpha + (1 - alpha) * end[0];
            c[1] = start[1] * alpha + (1 - alpha) * end[1];
            c[2] = start[2] * alpha + (1 - alpha) * end[2];
            colors[i] = convertToHex(c);
        }
        return colors;
    }
};
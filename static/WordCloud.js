var WordCloud = function(type) {
    var self = this;
    self.type = type;

    // Set colors for synonyms
    var blues = ["#eff3ff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#084594", "#08306b"];
    // Set colors for antonyms
    var reds = ["#fff5f0", "#fee5d9", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"];
    // Colors for broadcast word cloud
    var colors = d3.scale.category20();

    /* Sets selector of block where chart would be placed */
    this.selector = function (s) {
        self._selector = s;
        return self;
    };

    this.init = function () {
        self.width = parseInt($(self._selector).css('width'));
        self.height = 400;

        self.svg = d3.select(self._selector).append("svg")
            .attr("width", self.width)
            .attr("height", self.height)
            .append("g")
            .attr("transform", "translate(" + self.width / 2 + "," + self.height / 2 + ")");

        self.loading = self.svg.append("text")
            .attr("x", 0)
            .attr("y", 0)
           // .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .attr("font-size", 40)
            .attr("fill", "#ddd")
            .text("JUST NO ONE WORD");
    };

    this.update = function(words) {
        d3.layout.cloud()
            .size([self.width, self.height])
            .words(words)
            .padding(5)
            .rotate(function() { return ~~(Math.random() * 2) * 90; })
            .fontSize(function(d) { return d.size; })
            .on("end", draw)
            .start();
    };

    function draw(words) {
        if (self.loading) {
            self.loading.remove();
        }

        var cloud = self.svg.selectAll("g text")
            .data(words, function(d) { return d.text; });

        // Remove existing words
        if (self.type !== 'broadcast') {
            self.svg.selectAll("g text")
                .transition().duration(400)
                .style('fill-opacity', 0)
                .attr('font-size', 0)
                .remove();
        } else {
            cloud.transition().duration(400)
                .style('fill-opacity', 0)
                .attr('font-size', 0)
                .remove();
        }

        cloud.enter().append("text")
            .style("fill", function(d, i) { return self.type == 'broadcast' ? colors(i) : set_color(d); })
            .attr("text-anchor", "middle")
            .attr('font-size', 1)
            .text(function(d) { return d.text; });

        cloud.transition().duration(1000)
            .style("font-size", function(d) { return d.size + "px"; })
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .style("fill-opacity", 1);
    }

    function set_color(w) {
        var len = w.text.length % 10;
        return w.flag == 1 ? blues[len] : reds[len]
    }
};
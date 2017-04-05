var RotatingGlobe = function () {
    var self = this;

    /* Sets selector of block where chart would be placed */
    this.selector = function (s) {
        self._selector = s;
        return self;
    };

    this.init = function () {
        self.width = parseInt($(self._selector).css('width'));
        self.height = self.width;

        self.projection = d3.geo.orthographic()
            .scale(self.width / 2.3)
            .rotate([0, 0])
            .translate([self.width / 2, self.height / 2])
            .clipAngle(90);

        self.graticule = d3.geo.graticule();

        self.canvas = d3.select(self._selector).append("canvas")
            .attr("width", self.width)
            .attr("height", self.height);

        self.context = self.canvas.node().getContext("2d");

        self.title = d3.select("h1");

        self.path = d3.geo.path()
            .projection(self.projection)
            .context(self.context);

        queue()
            .defer(d3.json, "/static/geodata/world.json")
            .await(ready);
    };


    function ready(error, world) {
        if (error) throw error;

        var globe = {type: "Sphere"},
            land = topojson.feature(world, world.objects.land),
            countries = topojson.feature(world, world.objects.countries).features,
            borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }),
            grid = self.graticule(),
            i = -1,
            n = countries.length;

        var back = [180, 0];

        var arr = [[10,10], [50,50], [-20, 80]];

        (function transition() {
            d3.transition()
                .duration(1000)
                .each("start", function() {
                    self.title.text(countries[i = (i + 1) % n].name);
                })
                .tween("rotate", function() {
                    var p = d3.geo.centroid(countries[i]),
                        r = d3.interpolate(self.projection.rotate(), [-p[0], -p[1]]),
                        r_back = d3.interpolate(back, [180-p[0], p[1]]);
                    return function(t) {
                        self.context.clearRect(0, 0, self.width, self.height);

                        // forehand: water
                        self.context.beginPath();
                        self.path(globe);
                        self.context.lineWidth = 3;
                        self.context.strokeStyle = "#000";
                        self.context.stroke();
                        self.context.fillStyle = "#0099FF";
                        self.context.fill();

                        self.context.save();
                        self.context.translate(self.width / 2, 0);
                        self.context.scale(-1, 1);
                        self.context.translate(-self.width / 2, 0);
                        self.projection.rotate(r_back(t));
                        back = self.projection.rotate().slice(0,2);

                        // background: land
                        self.context.beginPath();
                        self.path(land);
                        self.context.fillStyle = "#3366FF";
                        self.context.fill();

                        // background: parallels and meridians
                        self.context.beginPath();
                        self.path(grid);
                        self.context.lineWidth = .5;
                        self.context.strokeStyle = "rgba(119,119,119,.5)";
                        self.context.stroke();

                        self.context.restore();
                        self.projection.rotate(r(t));

                        // forehand: parallels and meridians
                        self.context.beginPath();
                        self.path(grid);
                        self.context.lineWidth = .5;
                        self.context.strokeStyle = "rgba(119,119,119,1)";
                        self.context.stroke();

                        // forehand: land
                        self.context.beginPath();
                        self.path(land);
                        self.context.fillStyle = "#3CB371";
                        self.context.fill();
                        self.context.lineWidth = .5;
                        self.context.strokeStyle = "#000";
                        self.context.stroke();

                        // active country
                        self.context.beginPath();
                        self.context.fillStyle = "#CC3300";
                        self.path(countries[i]);
                        self.context.fill();
                        self.context.strokeStyle = "#fff";
                        self.context.lineWidth = 1;
                        self.context.beginPath();
                        self.path(borders);
                        self.context.stroke();
                    };
                })
                .transition()
                .each("end", transition);
        })();
    }
};
var RotatingGlobe = function () {
    var self = this;
    var sens = 0.25,
        focused;

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
            .rotate([180, 0])
            .translate([self.width / 2, self.height / 2])
            .clipAngle(90)
            .precision(0.6);

        self.graticule = d3.geo.graticule();

        self.canvas = d3.select(self._selector).append("canvas")
            .attr("width", self.width)
            .attr("height", self.height);

        self.context = self.canvas.node().getContext("2d");

        self.title = d3.select("h1");

        self.path = d3.geo.path()
            .projection(self.projection)
            .context(self.context);

        self.countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip");

        queue()
            .defer(d3.json, "static/geodata/world.json")
            .defer(d3.tsv, "static/geodata/world_country_names.tsv")
            .await(ready);
    };

    function ready(error, world, names) {
        if (error) throw error;

        var globe = {type: "Sphere"},
            land = topojson.feature(world, world.objects.land),
            countries = topojson.feature(world, world.objects.countries).features,
            borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }),
            grid = self.graticule(),
            i = -1,
            n = countries.length;

            countries = countries.filter(function(d) {
                return names.some(function(n) {
                    if (d.id == +n["?id"]) return d.name = n.name;
                });
            }).sort(function(a, b) {
                return a.name.localeCompare(b.name);
            });

        (function transition() {
            d3.transition()
                .duration(1250)
                .each("start", function() {
                    self.title.text(countries[i = (i + 1) % n].name);
                })
                .tween("rotate", function() {
                    var p = d3.geo.centroid(countries[i]),
                        r = d3.interpolate(self.projection.rotate(), [-p[0], -p[1]]),
                        r_back = d3.interpolate(self.projection.rotate(), [180-p[0], +p[1]]);
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

                        // background: land
                        self.context.beginPath();
                        self.path(land);
                        self.context.fillStyle = "#3399CC";
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

/*
        var countryById = {},
            countries = topojson.feature(world, world.objects.countries).features;

            //Adding countries to select

            countryData.forEach(function(d) {
                countryById[d.id] = d.name;
            });

            //Drawing countries on the globe
            var world = self.svg.selectAll("path.land")
            .data(countries)
            .enter().append("path")
            .attr("class", "land")
            .attr("d", self.path)
            /*.call(d3.behavior.drag()
                .origin(function() { var r = self.projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
                .on("drag", function() {
                    var rotate = self.projection.rotate();
                    self.projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
                    self.svg.selectAll("path.land").attr("d", self.path);
                    self.svg.selectAll(".focused").classed("focused", focused = false);
                })
            )
            .on("mouseover", function(d) {
                self.countryTooltip.text(countryById[d.id])
                    .style("left", (d3.event.pageX + 7) + "px")
                    .style("top", (d3.event.pageY - 15) + "px")
                    .style("display", "block")
                    .style("opacity", 1);
            })
            .on("mouseout", function(d) {
                self.countryTooltip.style("opacity", 0)
                    .style("display", "none");
            })
            .on("mousemove", function(d) {
                self.countryTooltip.style("left", (d3.event.pageX + 7) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");
            });

            //Country focus on option select
            d3.select("select").on("change", function() {
              var rotate = projection.rotate(),
              focusedCountry = country(countries, this),
              p = d3.geo.centroid(focusedCountry);

              svg.selectAll(".focused").classed("focused", focused = false);

            //Globe rotating

            (function transition() {
              d3.transition()
              .duration(2500)
              .tween("rotate", function() {
                var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                return function(t) {
                  projection.rotate(r(t));
                  svg.selectAll("path").attr("d", path)
                  .classed("focused", function(d, i) { return d.id == focusedCountry.id ? focused = d : false; });
                };
              })
              })();
            });

            function country(cnt, sel) {
              for(var i = 0, l = cnt.length; i < l; i++) {
                if(cnt[i].id == sel.value) {return cnt[i];}
              }
            };

          };
*/
    }
};
/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/18/2014
 * @name        PathBubble_D3Table
 */

PATHBUBBLES.D3Table = function (parent, w, h) {
    this.parent = parent;
    this.w = w;
    this.h = h;
    this.data = null;
    this.dbId = null;
    this.keepQuery = true;
};

PATHBUBBLES.D3Table.prototype = {
    constructor: PATHBUBBLES.D3Table,
    init: function (dbId, querySymbol) {
        this.dbId = dbId;
        var _this = this;
        var margin = {top: 20, right: 5, bottom: 20, left: 3},
            width = this.w - margin.left - margin.right,
            height = this.h - margin.top - margin.bottom;

        var container = d3.select("#svg" + this.parent.id)
            .attr("width", Math.min(this.w, width + margin.left + margin.right))
            .attr("height", Math.min(this.h, height + margin.top + margin.bottom))
            .style("border", "2px solid #000")
            .style("overflow", "scroll");

        var table = container.append("table")
            .attr("width", Math.min(this.w, width + margin.left + margin.right))
            .attr("height", Math.min(this.h, height + margin.top + margin.bottom))
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var thead = table.append("thead");
        var tbody = table.append("tbody");

        var previousSort = null;
        var format = d3.time.format("%a %b %d %Y");

        refreshTable(null);

        function refreshTable(sortOn) {
            if (_this.data == null) {
                if (querySymbol !== null && querySymbol !== undefined) {
                    $.ajax({
                        url: "./php/querybyPathwayIdSymbol.php",
                        type: "GET",
                        data: {
                            pathwaydbId: dbId,
                            symbol: querySymbol
                        },
                        dataType: "json",
                        success: function (jsonData) {
                            operation(jsonData);
                        },
                        error: function () {
                        }
                    });
                }
                else {
                    $.ajax({
                        url: "./php/querybyPathwayId.php",
                        type: "GET",
                        data: {
                            pathwaydbId: dbId
                        },
                        dataType: "json",
                        success: function (jsonData) {
                            operation(jsonData);
                        },
                        error: function () {
                        }
                    });
                }
            }
            else {
                operation(_this.data);
            }

            function operation(jsonData) {

                // create the table header
                var thead = d3.select("thead").selectAll("th")
                    .data(d3.keys(jsonData[0]))
                    .enter().append("th").text(function (d) {
                        return d;
                    })
                    .style("cursor", "s-resize")
                    .on("click", function (d) {
                        return refreshTable(d);
                    });

                // fill the table
                // create rows
                var tr = d3.select("tbody")
                    .selectAll("tr")
                    .data(jsonData);
                tr.enter().append("tr");

                // create cells
                var td = tr.selectAll("td")
                    .data(function (d) {
//                    return d3.values(d);
                        return d3.entries(d);
                    })
                    .enter()
                    .append("td")
                    .text(function(d) {
                        return d.value;
                    })
                    .on("click", function(d){
                            alert(d.value);
                    });
                if (sortOn !== null) {
                    // update rows
                    if (sortOn != previousSort) {
                        tr.sort(function (a, b) {
                            return sort(a[sortOn], b[sortOn]);
                        });
                        previousSort = sortOn;
                    }
                    else {
                        tr.sort(function (a, b) {
                            return sort(b[sortOn], a[sortOn]);
                        });
                        previousSort = null;
                    }

                    //update cells
                    td.text(function (d) {
                        return d.value;
                    });
                }
            }
        }

        function sort(a, b) {
            if (typeof a == "string") {
                var parseA = format.parse(a);
                if (parseA) {
                    var timeA = parseA.getTime();
                    var timeB = format.parse(b).getTime();
                    return timeA > timeB ? 1 : timeA == timeB ? 0 : -1;
                }
                else
                    return a.localeCompare(b);
            }
            else if (typeof a == "number") {
                return a > b ? 1 : a == b ? 0 : -1;
            }
            else if (typeof a == "boolean") {
                return b ? 1 : a ? -1 : 0;
            }
        }
    }
};
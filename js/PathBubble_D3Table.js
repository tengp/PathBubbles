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
        var margin = {top: 20, right: 3, bottom: 20, left: 3},
            width = this.w - margin.left - margin.right,
            height = this.h - margin.top - margin.bottom;

        d3.select("#svg" + this.parent.id)
            .attr("width", width)
            .attr("height", height);

        var container = d3.select("#svg" + this.parent.id)
            .attr("width", width )
            .attr("height",  height )
            .style("border", "2px solid #000")
            .style("overflow", "scroll");

        var table = container.append("table")
            .attr("width", width )
            .attr("height", height );
          //  .append("g")
//            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        table.append("thead");
        table.append("tbody");

        var previousSort = null;
        var format = d3.time.format("%a %b %d %Y");

        refreshTable(null);
        function refreshTable(sortOn){

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

                _this.parent.h = Math.min(jsonData.length *12+100, 400);
                _this.h = Math.min(jsonData.length *12+100, 400);
                height = _this.h - margin.top - margin.bottom;
                d3.select("#svg" + _this.parent.id)
                    .attr("width", width )
                    .attr("height",  height );
                d3.select("#svg" + _this.parent.id).select("table")
                    .attr("width", width )
                    .attr("height",  height );
                // create the table header
                var thead = d3.select("#svg" + _this.parent.id).select("thead").selectAll("th")
                    .data(d3.keys(jsonData[0]))
                    .enter().append("th")
                    .text(function (d) {
                        if(d=="ratio")
                            return "ratio(log2 based)";
                        return d;
                    })
                    .on("click", function (d) {
                        return refreshTable(d);
                    });

                // fill the table
                // create rows
                var tr = d3.select("#svg" + _this.parent.id).select("tbody").selectAll("tr").data(jsonData);
                tr.enter().append("tr");

                // create cells
                var td = tr.selectAll("td").data(function (d) {
                    return d3.entries(d);
                });
                td.enter().append("td")
                    .attr("class", function (d) {
                        if (_this.keepQuery && d.key == "symbol")
                            return "hyper";
                        else
                            return "normalCell";
                    })
                    .text(function (d) {
                        return d.value;
                    })
                    .on("contextmenu", function (d, i) {
                        if (_this.keepQuery && d.key == "symbol")
                            if (d.value == String(d.value)) {
                                var bubble = new PATHBUBBLES.Table(_this.parent.x + _this.parent.offsetX + _this.parent.w - 40, _this.parent.y + _this.parent.offsetY, 530, 500, null, null, {dbId: _this.dbId, symbol: d.value});
                                bubble.name = _this.parent.name + "-" + d.value;
                                bubble.addHtml();
                                bubble.table.keepQuery = false;
                                bubble.menuOperation();

                                if (viewpoint) {
                                    bubble.offsetX = viewpoint.x;
                                    bubble.offsetY = viewpoint.y;
                                }
                                scene.addObject(bubble);
                                if (!_this.parent.GROUP) {
                                    var group = new PATHBUBBLES.Groups();
                                    group.objectAddToGroup(_this.parent);
                                    group.objectAddToGroup(bubble);
                                    scene.addObject(group);
                                }
                                else {
                                    if (_this.parent.parent instanceof  PATHBUBBLES.Groups) {
                                        _this.parent.parent.objectAddToGroup(_this.parent);
                                        _this.parent.parent.objectAddToGroup(bubble);
                                        scene.addObject(_this.parent.parent);
                                    }
                                }
                                d3.event.preventDefault();
                            }
                    });

                //update?
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

        function sort(a,b){
            if(typeof a == "string"){
//                var parseA = format.parse(a);
//                if(parseA){
//                    var timeA = parseA.getTime();
//                    var timeB = format.parse(b).getTime();
//                    return timeA > timeB ? 1 : timeA == timeB ? 0 : -1;
//                }
//                else
//                    return a.localeCompare(b);
                if(typeof parseFloat(a) == "number" && typeof parseFloat(b) == "number" )
                {
                    if(!isNaN( parseFloat(a) ) && !isNaN (parseFloat(b) )  )
                        return parseFloat(a) > parseFloat(b) ? 1 : parseFloat(a) == parseFloat(b) ? 0 : -1;
                    else
                        return a.localeCompare(b);
                }
                else
                    return a.localeCompare(b);
            }
            else if(typeof a == "number"){
                return a > b ? 1 : a == b ? 0 : -1;
            }
            else if(typeof a == "boolean"){
                return b ? 1 : a ? -1 : 0;
            }
        }
    }
};
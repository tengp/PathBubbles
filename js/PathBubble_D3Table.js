/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/18/2014
 * @name        PathBubble_D3Table
 */

PATHBUBBLES.D3Table = function(parent, w, h){
    this.parent = parent;
    this.w = w;
    this.h = h;
    this.data = null;
};

PATHBUBBLES.D3Table.prototype = {
    constructor: PATHBUBBLES.D3Table,
    init: function(dbId){
        var _this =this;
        var margin = {top: 20, right: 10, bottom: 20, left: 10},
            width = this.w - margin.left - margin.right,
            height = this.h - margin.top - margin.bottom;
        d3.select("#svg"+this.parent.id)
            .attr("width", this.w )
            .attr("height", this.h);

        var container = d3.select("#svg"+this.parent.id)
            .attr("width", Math.min(this.w, width + margin.left + margin.right) )
            .attr("height", Math.min(this.h, height + margin.top + margin.bottom))
            .style("border", "2px solid #000")
            .style("overflow", "scroll");

        var svg = container.append('svg')
            .attr("width", Math.min(this.w, width + margin.left + margin.right))
            .attr("height", Math.min(this.h, height + margin.top + margin.bottom))
            .style("vertical-align", "middle")
            .style("box-shadow", "inset 0 0 3px 0px #CECECE")
            .style("background", "rgba(255,255,255, 0.2)")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var headerGrp = svg.append("g").attr("class", "headerGrp");
        var rowsGrp = svg.append("g").attr("class","rowsGrp");

        var previousSort = null;
        var format = d3.time.format("%a %b %d %Y");

        refreshTable(null);

        function refreshTable(sortOn){
            var fieldHeight = 30;
            var fieldWidth = 90;
            if(_this.data==null)
            {
                $.ajax({
                    type: "GET",
                    url: "./data/pathFiles/" + dbId +"_7protein.txt",
                    dataType: "text",
                    success: function (txt) {
                        var jsonData = [];
                        txt = txt.split("\t\n");
                        for(var i=0; i<txt.length; ++i)
                        {
                            var arrays=txt[i].split("\t");
                            if(arrays.length !== 5)
                                continue;
                            var obj = {};
                            obj.proteinName =arrays[1];

                            var unis = arrays[2].split(":");
                            var uniSymbols = unis[1].split(" ");
                            obj.UniProtID =uniSymbols[0];
                            obj.displaySimbol =uniSymbols[1];
                            var reactome = arrays[3].split(":");
                            obj.reactomeId =reactome[1];
                            obj.compartmentName =arrays[4];
                            jsonData.push(obj);
                        }
                        operation(jsonData);
                    },
                    error: function () {
                    }
                });
            }
            else
            {
//                _this.parent.name = "(Shared protein) "+ _this.parent.name;
                operation(_this.data);
            }

            function operation(jsonData)
            {
                $("#svg"+_this.parent.id).children("svg").css({
                    height: Math.max((fieldHeight+1) * jsonData.length + 2*(margin.top + margin.bottom), height + margin.top + margin.bottom)
                });
                // create the table header
                var header = headerGrp.selectAll("g")
                    .data(d3.keys(jsonData[0]))
                    .enter().append("g")
                    .attr("class", "header")
                    .attr("transform", function (d, i){
                        return "translate(" + i * fieldWidth + ",0)";
                    })
                    .on("click", function(d){ return refreshTable(d);});

                header.append("rect")
                    .attr("width", fieldWidth-1)
                    .attr("height", fieldHeight)
                    .style("fill", "#333").style("stroke", "#000000");

                header.append("text")
                    .attr("x", fieldWidth / 2)
                    .attr("y", fieldHeight / 2)
                    .attr("dy", ".35em")
                    .style("fill", "#fff")
                    .style("font-family", "sans-serif" )
                    .style("font-size", "10px" )
                    .style("text-anchor", "middle" )
                    .text(String);
                var rows = rowsGrp.selectAll("g.row").data(jsonData);

                // create rows
                var rowsEnter = rows.enter().append("svg:g")
                    .attr("class","row")
                    .attr("id",function (d, i){
                        return "row" + i;
                    })
                    .attr("transform", function (d, i){
                        return "translate(0," + (i+1) * (fieldHeight+1) + ")";
                    });

                // select cells
                var cells = rows.selectAll("g.cell").data(function(d){return d3.values(d);});

                // create cells
                var cellsEnter = cells.enter().append("svg:g")
                    .attr("class", "cell")
                    .attr("id",function (d, i){
                        return "column" + i;
                    })
                    .attr("transform", function (d, i){
                        return "translate(" + i * fieldWidth + ",0)";
                    });

                cellsEnter.append("rect")
                    .attr("width",fieldWidth -1)
                    .attr("height", fieldHeight)
                    .style("fill", "#ffffff")
                    .style("stroke", "#000000");

                cellsEnter.append("text")
                    .attr("x", fieldWidth / 2)
                    .attr("y", fieldHeight / 2)
                    .attr("dy", ".35em")
                    .style("fill", "#000")
                    .style("font-family", "sans-serif" )
                    .style("font-size", "10px" )
                    .style("text-anchor", "middle" )
                    .text(String);

                //update if not in initialisation
                if(sortOn !== null) {
                    // update rows
                    if(sortOn != previousSort){
                        rows.sort(function(a,b){return sort(a[sortOn], b[sortOn]);});
                        previousSort = sortOn;
                    }
                    else{
                        rows.sort(function(a,b){return sort(b[sortOn], a[sortOn]);});
                        previousSort = null;
                    }
                    rows.transition()
                        .duration(500)
                        .attr("transform", function (d, i){
                            return "translate(0," + (i+1) * (fieldHeight+1) + ")";
                        });

                    //update cells
                    rows.selectAll("g.cell").select("text").text(String);
                }
            }
        }

        function sort(a,b){
            if(typeof a == "string"){
                var parseA = format.parse(a);
                if(parseA){
                    var timeA = parseA.getTime();
                    var timeB = format.parse(b).getTime();
                    return timeA > timeB ? 1 : timeA == timeB ? 0 : -1;
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
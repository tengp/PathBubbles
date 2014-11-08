/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/10/2014
 * @name        PathBubble_D3Ring
 */
PATHBUBBLES.D3Ring = function (parent, defaultRadius, dataType, name) {
    this.parent = parent;
    this.defaultRadius = defaultRadius;
    this.name = name || null;
    this.file = "./data/Ortholog/" + dataType + "/" + name + ".json";
    this.customOrtholog = null;
    this.selectedData = null;
    this.showCrossTalkLevel = 1;
    this.ChangeLevel = false;
    this.customExpression = null;
    this.expressionScaleMax = null;
    this.maxLevel = 6;
};
PATHBUBBLES.D3Ring.prototype = {
    constructor: PATHBUBBLES.D3Ring,
    init: function () {
//        if(maxLevel!== undefined)
//            this.maxLevel = maxLevel;
        var _this = this;
        var width = this.defaultRadius,
            height = this.defaultRadius,
            radius = Math.min(width, height) / 2;
        var x = d3.scale.linear()
            .range([0, 2 * Math.PI]);

        var y = d3.scale.sqrt()
            .range([0, radius]);

        var color = d3.scale.category20c();

        var svg = d3.select("#svg" + _this.parent.id).append("svg")
            .attr("width", width)
            .attr("height", _this.parent.h);
        var colors = ["#fdae6b", "#a1d99b", "#bcbddc"];


        var mainSvg = svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + (height / 2 ) + ")");

        var partition = d3.layout.partition()
            .value(function (d) {
                return d.size;
            });
        var arc = d3.svg.arc()
            .startAngle(function (d) {
                return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
            })
            .endAngle(function (d) {
                return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
            })
            .innerRadius(function (d) {
                return Math.max(0, y(d.y));
            })
            .outerRadius(function (d) {
                return Math.max(0, y(d.y + d.dy));
            });

        var tooltip = d3.select("#svg" + this.parent.id)
            .append("div")
            .attr("class", "tooltip")
            .style("fill", "#000")
            .style("position", "absolute")
            .style("z-index", "10");

        function format_number(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        function format_name(d) {
            var name = d.name;
            return  '<b>' + name + '</b>';
        }

        var nodeData;
        //edge ----------------------------------------------------------------------------
        var bundle = d3.layout.bundle();
        var diagonal = d3.svg.diagonal()
            .projection(function (d) {
                return [d.x, d.y];
            });
        var _this = this;
//        var maxLevel = 1;
        var minRatio;
        var maxRatio;
        if (_this.selectedData == null) {
            d3.json(_this.file, function (error, root) {
                if (_this.customOrtholog && !_this.customExpression) {
                    nodeData = partition.nodes(root);
                    for (var i = 0; i < nodeData.length; ++i)  //every pathway
                    {
                        if (nodeData[i].symbols == undefined) {
                            continue;
                        }
                        var count = 0;
                        nodeData[i].gallusOrth = {};
                        nodeData[i].gallusOrth.sharedSymbols = [];
                        for (var k = 0; k < nodeData[i].symbols.length; ++k) {
                            for (var j = 0; j < _this.customOrtholog.length; ++j) {
                                if (nodeData[i].symbols[k] == _this.customOrtholog[j].symbol) {
                                    if (_this.customOrtholog[j].dbId !== "\N") {
                                        count++;
                                        nodeData[i].gallusOrth.sharedSymbols.push(_this.customOrtholog[j].symbol);
                                        break;
                                    }
                                }
                            }
                        }

                        if (count === nodeData[i].symbols.length) {
                            nodeData[i].gallusOrth.type = "Complete";
//                            nodeData[i].gallusOrth.count = count;
                        }
                        else if (count === 0) {
                            nodeData[i].gallusOrth.type = "Empty";
//                            nodeData[i].gallusOrth.count = count;
                        }
                        else {
                            nodeData[i].gallusOrth.type = "Part";
//                            nodeData[i].gallusOrth.count = count;
                        }
                    }
                    _this.maxLevel = d3.max(nodeData, function (d) {

                        return d.depth;
                    });

                    if (!_this.ChangeLevel) {
//                        maxLevel = 6;
                        var tmpString = "";
                        for (var i = 1; i <= _this.maxLevel; ++i) {
                            tmpString += '<option value=' + i + '>' + "crossTalkLevel " + i + '</option>';
                        }
                        $('#menuView' + _this.parent.id).find("#crossTalkLevel").html(tmpString);
                        _this.parent.name = root.name + " " + _this.parent.name;
                    }

                    operation(nodeData);
                }   //Custom Ortholog
                else if (_this.customExpression && !_this.customOrtholog)    //Default Ortholog //custom expression
                {
                    var $menuBarbubble = $('#menuView' + _this.parent.id); //Custom Ortholog   //custom expression
                    var minRatio = $menuBarbubble.find('#minRatio').val();
                    var maxRatio = $menuBarbubble.find('#maxRatio').val();
                    if (minRatio == "")
                        minRatio = "0.5";
                    if (maxRatio == "")
                        maxRatio = "2.0";
                    minRatio = parseFloat(minRatio);
                    maxRatio = parseFloat(maxRatio);
                    nodeData = partition.nodes(root);
                    for (var i = 0; i < nodeData.length; ++i)  //every pathway
                    {
                        if (nodeData[i].gallusOrth == undefined) {
                            continue;
                        }
                        if (nodeData[i].gallusOrth.sharedSymbols == undefined) {
                            continue;
                        }
                        nodeData[i].expression = {};
                        nodeData[i].expression.ups = [];
                        nodeData[i].expression.downs = [];
                        nodeData[i].expression.unchanges = [];
                        for (var k = 0; k < nodeData[i].gallusOrth.sharedSymbols.length; ++k) {

                            for (var j = 0; j < _this.customExpression.length; ++j) {
                                if (nodeData[i].gallusOrth.sharedSymbols[k] == _this.customExpression[j].symbol) {
                                    if (parseFloat(_this.customExpression[j].ratio) >= maxRatio) {
                                        nodeData[i].expression.ups.push(_this.customExpression[j]);
                                        break;
                                    }
                                    else if (parseFloat(_this.customExpression[j].ratio) <= minRatio) {
                                        nodeData[i].expression.downs.push(_this.customExpression[j]);
                                        break;
                                    }
                                    else {
                                        nodeData[i].expression.unchanges.push(_this.customExpression[j]);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    _this.maxLevel = d3.max(nodeData, function (d) {

                        return d.depth;
                    });
                    if (!_this.ChangeLevel) {
//                        maxLevel = 6;
                        var tmpString = "";
                        for (var i = 1; i <= _this.maxLevel; ++i) {
                            tmpString += '<option value=' + i + '>' + "crossTalkLevel " + i + '</option>';
                        }
                        $('#menuView' + _this.parent.id).find("#crossTalkLevel").html(tmpString);
                        _this.parent.name = root.name + " " + _this.parent.name;
                    }
                    operation(nodeData);
                }
                else if (_this.customExpression && _this.customOrtholog) {
                    var $menuBarbubble = $('#menuView' + _this.parent.id);
                    var minRatio = $menuBarbubble.find('#minRatio').val();
                    var maxRatio = $menuBarbubble.find('#maxRatio').val();
                    if (minRatio == "")
                        minRatio = "0.5";
                    if (maxRatio == "")
                        maxRatio = "2.0";
                    minRatio = parseFloat(minRatio);
                    maxRatio = parseFloat(maxRatio);
                    nodeData = partition.nodes(root);
                    for (var i = 0; i < nodeData.length; ++i)  //every pathway
                    {
                        if (nodeData[i].symbols == undefined) {
                            continue;
                        }
                        //---------------------
                        var count = 0;
                        nodeData[i].gallusOrth = {};
                        nodeData[i].gallusOrth.sharedSymbols = [];

                        //---------------------
                        nodeData[i].expression = {};
                        nodeData[i].expression.ups = [];
                        nodeData[i].expression.downs = [];
                        nodeData[i].expression.unchanges = [];

                        for (var k = 0; k < nodeData[i].symbols.length; ++k) {
                            for (var j = 0; j < _this.customOrtholog.length; ++j) {
                                if (nodeData[i].symbols[k] == _this.customOrtholog[j].symbol) {
                                    if (_this.customOrtholog[j].dbId !== "\N") {
                                        count++;
                                        nodeData[i].gallusOrth.sharedSymbols.push(_this.customOrtholog[j].symbol);
                                        break;
                                    }
                                }
                            }
                        }
                        for (var k = 0; k < nodeData[i].gallusOrth.sharedSymbols.length; ++k) {
                            for (var j = 0; j < _this.customExpression.length; ++j) {
                                if (nodeData[i].gallusOrth.sharedSymbols[k] == _this.customExpression[j].symbol) {
                                    if (parseFloat(_this.customExpression[j].ratio) >= maxRatio) {
                                        nodeData[i].expression.ups.push(_this.customExpression[j]);
                                        break;
                                    }
                                    else if (parseFloat(_this.customExpression[j].ratio) <= minRatio) {
                                        nodeData[i].expression.downs.push(_this.customExpression[j]);
                                        break;
                                    }
                                    else {
                                        nodeData[i].expression.unchanges.push(_this.customExpression[j]);
                                        break;
                                    }
                                }
                            }
                        }
                        if (count === nodeData[i].symbols.length) {
                            nodeData[i].gallusOrth.type = "Complete";
//                            nodeData[i].gallusOrth.count = count;
                        }
                        else if (count === 0) {
                            nodeData[i].gallusOrth.type = "Empty";
//                            nodeData[i].gallusOrth.count = count;
                        }
                        else {
                            nodeData[i].gallusOrth.type = "Part";
//                            nodeData[i].gallusOrth.count = count;
                        }
                    }
                    _this.maxLevel = d3.max(nodeData, function (d) {

                        return d.depth;
                    });
                    if (!_this.ChangeLevel) {
//                        maxLevel = 6;
                        var tmpString = "";
                        for (var i = 1; i <= _this.maxLevel; ++i) {
                            tmpString += '<option value=' + i + '>' + "crossTalkLevel " + i + '</option>';
                        }
                        $('#menuView' + _this.parent.id).find("#crossTalkLevel").html(tmpString);
                        _this.parent.name = root.name + " " + _this.parent.name;
                    }
                    operation(nodeData);
                }
                else {
                    nodeData = partition.nodes(root);
                    _this.maxLevel = d3.max(nodeData, function (d) {
                        return d.depth;
                    });
                    if (!_this.ChangeLevel) {
//                        maxLevel = 6;
                        var tmpString = "";
                        for (var i = 1; i <= _this.maxLevel; ++i) {
                            tmpString += '<option value=' + i + '>' + "crossTalkLevel " + i + '</option>';
                        }
                        $('#menuView' + _this.parent.id).find("#crossTalkLevel").html(tmpString);
                        _this.parent.name = root.name + " " + _this.parent.name;
                    }
//                    crossTalkFileName = "./data/crossTalkData/" + nodeData[0].name + ".json";
                    operation(nodeData);
                }
            });
        }
        else {
            nodeData = partition.nodes(_this.selectedData);
            _this.maxLevel = d3.max(nodeData, function (d) {

                return d.depth;
            });
            if (!_this.ChangeLevel) {
//                maxLevel = _this.selectedData.maxLevel - _this.selectedData.depth;
                var tmpString = "";
                for (var i = 1; i <= _this.maxLevel; ++i) {
                    tmpString += '<option value=' + i + '>' + "crossTalkLevel " + i + '</option>';
                }
                $('#menuView' + _this.parent.id).find("#crossTalkLevel").html(tmpString);
                _this.parent.name = _this.selectedData.name + " " + _this.parent.name;
            }
//            crossTalkFileName = "./data/crossTalkData/" + nodeData[0].name + ".json";
            operation(nodeData);
        }
        function operation(nodeData) {

            var crossTalkFileName = "./data/crossTalkLevel/" + nodeData[0].name + ".json";
            $('#menuView' + _this.parent.id).find('#crossTalkLevel').val(_this.showCrossTalkLevel);
            d3.json(crossTalkFileName, function (error, crossTalkData) {
                var classes = crossTalkData[_this.showCrossTalkLevel - 1];

                var gGroup = mainSvg.append("g").attr("class", "graphGroup");
                var pathG = gGroup.append("g").selectAll(".path");
//                var bundleGroup = svg.append("g").attr("class", "bundleGroup");
                var link = gGroup.append("g").selectAll(".link");
                var node = gGroup.append("g").selectAll(".node");
                var textG = gGroup.append("g").selectAll(".text");
                if (_this.parent.HIDE) {
                    var max;
                    if (!_this.expressionScaleMax) {
                        max = d3.max(nodeData, function (d) {
                            if (d.name == "homo sapiens" || d.expression == undefined || d.gallusOrth == undefined)
                                return 0;
                            return (d.expression.downs.length + d.expression.ups.length) / d.gallusOrth.sharedSymbols.length;
                        });
                    }
                    else {
                        max = _this.expressionScaleMax;
                    }

                    var divisions = 10;

                    var scaleMargin = {top: 5, right: 5, bottom: 5, left: 5},
                        scaleWidth = 30 - scaleMargin.left - scaleMargin.right,
                        scaleHeight = 170 - scaleMargin.top - scaleMargin.bottom;

                    var newData = [];
                    var sectionHeight = Math.floor(scaleHeight / divisions);
                    if (max !== 0) {
                        for (var i = 0, j = 0; i < scaleHeight && j <= max; i += sectionHeight, j += max / 9) {
                            var obj = {};
                            obj.data = i;
                            obj.text = parseFloat(j).toFixed(4);
                            newData.push(obj);
                        }

                        var colorScaleLin = d3.scale.linear()
                            .domain([0, newData.length - 1])
                            .interpolate(d3.interpolateRgb)
                            .range([d3.rgb(243, 247, 213), d3.rgb(33, 49, 131)]);
                    }
                    else {
                        for (var i = 0, j = 0; i < scaleHeight && j <= max; i += sectionHeight, j += max / 9) {
                            var obj = {};
                            obj.data = i;
                            obj.text = parseFloat(j).toFixed(3);
                            newData.push(obj);
                        }
                        var colorScaleLin = d3.scale.linear()
                            .domain([0, newData.length - 1])
                            .interpolate(d3.interpolateRgb)
                            .range([d3.rgb(243, 247, 213), d3.rgb(243, 247, 213)]);
                    }

                    var BarWidth = scaleWidth + scaleMargin.left + scaleMargin.right;
                    var BarHeight = scaleHeight + scaleMargin.top + scaleMargin.bottom;

                    var colorScaleBar = svg.append("g")
                        .attr("class", "colorScaleBar")
                        .attr("transform", "translate(" + (width - 3 * scaleWidth) + "," + ( height + 40 - 10 * sectionHeight  ) + ")")
                        .attr("width", BarWidth)
                        .attr("height", BarHeight);

                    var colorRange = d3.scale.linear()
                        .domain([0, max])
                        .interpolate(d3.interpolateRgb)
                        .range([d3.rgb(243, 247, 213), d3.rgb(33, 49, 131)]);

                    colorScaleBar.selectAll('rect')
                        .data(newData)
                        .enter()
                        .append('rect')
                        .attr("x", 0)
                        .attr("y", function (d) {
                            return d.data;
                        })
                        .attr("height", sectionHeight)
                        .attr("width", scaleWidth)

                        .attr('fill', function (d, i) {
                            return colorScaleLin(i)
                        });
                    colorScaleBar.selectAll('text')
                        .data(newData)
                        .enter().append("text")
                        .style("font-size", 10)
                        .attr("transform", "translate(" + (scaleWidth / 2 + 10) + "," + (sectionHeight) + ")")
                        .attr("y", function (d, i) {
                            return d.data - 5;
                        })
                        .attr("dy", ".1em")
                        .style("text-anchor", "start")
                        .text(function (d, i) {
                            return d.text;
                        });
                }

                pathG = pathG.data(nodeData)
                    .enter().append("path")
                    .attr("id", function (d, i) {
                        return "group" + i;
                    })
                    .attr("d", arc)
                    .style("fill", function (d, i) {
                        if (i == 0)
                            return "#fff";
                        if (!_this.customExpression) {
                            if (d.children !== undefined)
                                var gallusOrth = (d.children ? d : d.parent).gallusOrth;
                            else
                                var gallusOrth = d.gallusOrth;
                            if (gallusOrth !== undefined) {
                                if (gallusOrth.type === "Part") {
                                    return colors[0];
                                }
                                else if (gallusOrth.type === "Complete") {
                                    return colors[1];
                                }
                                else if (gallusOrth.type === "Empty") {
                                    return colors[2];
                                }
                            }
                            else {
                                return "#fff";
                            }
                        }
                        else if (_this.customExpression) {
                            if (d.name == "homo sapiens" || d.expression == undefined || d.gallusOrth == undefined)
                                return "#fff";
                            else if (d.gallusOrth.sharedSymbols.length == 0) {
                                return colorRange(0);
                            }
                            else {
                                return colorRange((d.expression.downs.length + d.expression.ups.length) / d.gallusOrth.sharedSymbols.length);
                            }
                        }
                    })
                    .style("cursor", "pointer")
                    .on("contextmenu", rightClick)
                    .on("click", click)
                    .on("mouseover", function (d, i) {
                        if (d.name == "homo sapiens")
                            return;
                        tooltip.html(function () {
                            return format_name(d);
                        });
                        return tooltip.transition()
                            .duration(50)
                            .style("opacity", 0.9);
                    })
                    .on("mousemove", function (d, i) {
                        if (d.name == "homo sapiens")
                            return;
                        return tooltip
                            .style("top", (d3.event.pageY - 10 - _this.parent.y - _this.parent.offsetY - 70 ) + "px")
                            .style("left", (d3.event.pageX + 10 - _this.parent.x - _this.parent.offsetX) + "px");
                    })
                    .on("mouseout", function () {
                        return tooltip.style("opacity", 0);
                    });
                svg.on("mouseout", function () {
                    return tooltip.html("");
                });

                textG = textG.data(nodeData.filter(
                    function (d,i) {
                        if(i==0)          //center of the circle
                            return true;
                        var thea = Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))) - Math.max(0, Math.min(2 * Math.PI, x(d.x)));
                        var r = Math.max(0, y(d.y));
                        return thea * r >= 10;
                    }))
                    .enter().append("text")
                    .attr("class", "bar-text") // add class
                    .attr("text-anchor", function (d) {
                        return "middle";
//                        return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
                    })
                    .attr("transform", function (d, i) {
                        if (i == 0)
                            return "rotate(0)";
                        var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90;

                        return "rotate(" + angle + ")translate(" + (y(d.y) + 10) + ")rotate(" + (angle > 90 ? -180 : 0) + ")"
                    })
                    .attr("dy", ".35em") // vertical-align
                    .style("font-size", 10)
                    .text(function (d, i) {
                        if(d.name == "homo sapiens")
                            return "";
                        if (i == 0)
                            return d.name;
                        var str = d.name;
                        str = str.match(/\b\w/g).join('');
                        str = str.substr(0, 4);
                        return str;
                    });
                var symbol_max;

                function computeTextRotation(d, i) {
                    if (i == 0)
                        return 0;
                    var angle = x(d.x + d.dx / 2) - Math.PI / 2;
                    return angle / Math.PI * 180;
                }
                if (classes !== undefined && classes.length) {
                    var objects = processLinks(nodeData, classes);
                    var links = objects.imports;
                    if (!_this.customExpression) {
                        symbol_max = d3.max(objects.nodes, function (d) {
                            var temp = 0;
                            if (d.gallusOrth.sharedSymbols !== undefined)
                                temp = d.gallusOrth.sharedSymbols.length;
                            return temp;
                        });
                    }
                    else if (_this.customExpression) {
                        var upDownMax = d3.max(objects.nodes, function (d) {
                            if (d.expression !== undefined) {
                                return d.expression.ups.length + d.expression.downs.length;
                            }
                            else {
                                return 0;
                            }

                        });
                    }
                    var _nodes = objects.nodes;
//                    maxLevel = 6 - _nodes[0].depth;
                    link = link
                        .data(bundle(links))
                        .enter().append("path")
                        .each(function (d) {
                            d.source = d[0];
                            d.target = d[d.length - 1];
                        })
                        .attr("class", "link")
                        .attr("d", diagonal);
                    if (!_this.customExpression) {
                        node = node
                            .data(_nodes)
                            .attr("id", function (d, i) {
                                return "node" + d.dbId;
                            })
                            .enter().append("rect")
                            .attr("class", "node")
                            .attr("x", function (d) {
                                return y(d.dy);
                            })
                            .attr("height", function (d) {
                                var thea = Math.max(0, Math.min(2 * Math.PI, x(d.dx + d.d_dx))) - Math.max(0, Math.min(2 * Math.PI, x(d.dx)));
                                var r = Math.max(0, y(d.dy));
                                return Math.min(r * thea, Math.floor(_this.maxLevel + 4));
                            })
                            .attr("y", function (d) {
                                var thea = Math.max(0, Math.min(2 * Math.PI, x(d.dx + d.d_dx))) - Math.max(0, Math.min(2 * Math.PI, x(d.dx)));
                                var r = Math.max(0, y(d.dy));
                                return -(Math.min(r * thea, Math.floor(_this.maxLevel + 4))) / 2;
                            })
                            .attr("width", function (d) {
                                var temp = 0;
                                if (d.gallusOrth !== undefined)
                                    temp = d.gallusOrth.sharedSymbols.length;
                                if (symbol_max == 0)
                                    return 0;
                                return Math.floor(temp / symbol_max * ( Math.max(0, y(d.dy + d.d_dy)) - Math.max(0, y(d.dy)) ));
                            })
                            .attr("transform", function (d, i) {
                                return "rotate(" + computeRotation(d, i) + ")";
                            })
                            .style("fill", "#f00")
                            .on("contextmenu", barClick)
                            .on("mouseover", mouseovered)
                            .on("mouseout", mouseouted);
                    }
                    else {
                        node = node
                            .data(_nodes)
                            .attr("id", function (d, i) {
                                return "nodeUp" + d.dbId;
                            })
                            .enter().append("rect")
                            .attr("class", "node")
                            .attr("x", function (d) {
                                return y(d.dy);
                            })
                            .attr("height", function (d) {
                                var thea = Math.max(0, Math.min(2 * Math.PI, x(d.dx + d.d_dx))) - Math.max(0, Math.min(2 * Math.PI, x(d.dx)));
                                var r = Math.max(0, y(d.dy));
                                return Math.min(r * thea, Math.floor(_this.maxLevel + 4));
                            })
                            .attr("y", function (d) {
                                var thea = Math.max(0, Math.min(2 * Math.PI, x(d.dx + d.d_dx))) - Math.max(0, Math.min(2 * Math.PI, x(d.dx)));
                                var r = Math.max(0, y(d.dy));
                                return -(Math.min(r * thea, Math.floor(_this.maxLevel + 4))) / 2;
                            })
                            .attr("width", function (d) {
                                if (d.expression == undefined || d.gallusOrth == undefined || upDownMax == 0)
                                    return 0;
                                return Math.floor((d.expression.downs.length + d.expression.ups.length) / upDownMax * ( Math.max(0, y(d.dy + d.d_dy)) - Math.max(0, y(d.dy)) ));
                            })
                            .attr("transform", function (d, i) {
                                return "rotate(" + computeRotation(d, i) + ")";
                            })
                            .style("fill", "#f00")
                            .on("contextmenu", expressionBarClick)
                            .on("mouseover", mouseovered)
                            .on("mouseout", mouseouted);
                    }
                }
                else
                {
                    if (!_this.customExpression) {
                        symbol_max = d3.max(nodeData, function (d) {
                            var temp = 0;
                            if (d.gallusOrth.sharedSymbols !== undefined)
                                temp = d.gallusOrth.sharedSymbols.length;
                            return temp;
                        });
                    }
                    else if (_this.customExpression) {
                        var upDownMax = d3.max(nodeData, function (d) {
                            if (d.expression !== undefined) {
                                return d.expression.ups.length + d.expression.downs.length;
                            }
                            else {
                                return 0;
                            }
                        });
                    }
                    if (!_this.customExpression)
                    {
                        node = node
                            .data(nodeData.filter(function (d) {
                                return d.depth == 1;
                            }))
                            .enter().append("rect")
                            .attr("class", "node")
                            .attr("x", function (d) {
                                return y(d.y);
                            })
                            .attr("height", function (d) {
                                var thea = Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))) - Math.max(0, Math.min(2 * Math.PI, x(d.x)));
                                var r = Math.max(0, y(d.y));
                                return Math.min(r * thea, Math.floor(_this.maxLevel + 4));
                            })
                            .attr("y", function (d) {
                                var thea = Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))) - Math.max(0, Math.min(2 * Math.PI, x(d.x)));
                                var r = Math.max(0, y(d.y));
                                return -(Math.min(r * thea, Math.floor(_this.maxLevel + 4))) / 2;
                            })
                            .attr("width", function (d) {
                                var temp = 0;
                                if (d.gallusOrth !== undefined)
                                    temp = d.gallusOrth.sharedSymbols.length;
                                if (symbol_max == 0)
                                    return 0;
                                return Math.floor(temp / symbol_max * ( Math.max(0, y(d.y + d.dy)) - Math.max(0, y(d.y)) ));
                            })
                            .attr("transform", function (d, i) {
                                return "rotate(" + computeBarRotation(d, i) + ")";
                            })
                            .style("fill", "#f00")
                            .on("contextmenu", barClick);
                    }
                    else
                    {
                        node = node
                            .data(nodeData.filter(function (d) {
                                return d.depth == 1;
                            }))
                            .enter().append("rect")
                            .attr("class", "node")
                            .attr("x", function (d) {
                                return y(d.y);
                            })
                            .attr("height", function (d) {
                                var thea = Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))) - Math.max(0, Math.min(2 * Math.PI, x(d.x)));
                                var r = Math.max(0, y(d.y));
                                return Math.min(r * thea, Math.floor(_this.maxLevel + 4));
                            })
                            .attr("y", function (d) {
                                var thea = Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))) - Math.max(0, Math.min(2 * Math.PI, x(d.x)));
                                var r = Math.max(0, y(d.y));
                                return -(Math.min(r * thea, Math.floor(_this.maxLevel + 4))) / 2;
                            })
                            .attr("width", function (d) {
                                if (d.expression == undefined || d.gallusOrth == undefined || upDownMax == 0)
                                    return 0;
                                return Math.floor((d.expression.downs.length + d.expression.ups.length) / upDownMax * ( Math.max(0, y(d.y + d.dy)) - Math.max(0, y(d.y)) ));
                            })
                            .attr("transform", function (d, i) {
                                return "rotate(" + computeBarRotation(d, i) + ")";
                            })
                            .style("fill", "#f00")
                            .on("contextmenu", expressionBarClick);
                    }
                    function computeBarRotation(d, i) {
                        var angle = x(d.x + d.dx / 2) - Math.PI / 2;
                        return angle / Math.PI * 180;
                    }

                }

                function barClick() {
                    var symbols = d3.select(this).datum().gallusOrth.sharedSymbols;
                    var _symbols = [];
                    for (var i = 0; i < symbols.length; ++i) {
                        if (symbols[i] == null)
                            continue;
                        var symbolObj = {};
                        for (var j = 0; j < _symbols.length; ++j) {
                            if (_symbols[j].symbol.toUpperCase() == symbols[i].toUpperCase()) {
                                break;
                            }
                        }
                        if (j >= _symbols.length) {
                            symbolObj.symbol = symbols[i].toUpperCase();
                            symbolObj.count = 1;
                            _symbols.push(symbolObj);
                        }
                        else {
                            _symbols[j].count++;
                        }
                    }
                    var bubble = new PATHBUBBLES.Table(_this.parent.x + _this.parent.offsetX + _this.parent.w - 40, _this.parent.y + _this.parent.offsetY, 180, 400, d3.select(this).datum().dbId, _symbols);
                    bubble.name = "(Shared protein) " + d3.select(this).datum().name;
                    bubble.addHtml();
                    bubble.table.keepQuery = true;
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

                function expressionBarClick() {
                    if (d3.select(this).datum().expression == undefined)
                        return;
                    var ups = d3.select(this).datum().expression.ups;
                    var downs = d3.select(this).datum().expression.downs;
                    var _symbols = [];
                    for (var i = 0; i < ups.length; ++i) {
                        var symbolObj = {};
                        for (var j = 0; j < _symbols.length; ++j) {
                            if (_symbols[j].symbol == ups[i].symbol && _symbols[j].regulation == "Up") {
                                _symbols[j].count++;
                                break;
                            }
                        }
                        if (j >= _symbols.length) {

                            symbolObj.gene_id = ups[i].gene_id;
                            symbolObj.symbol = ups[i].symbol;
                            symbolObj.count = 1;
                            symbolObj.ratio = parseFloat(ups[i].ratio).toFixed(5);
                            symbolObj.regulation = "Up";
                            _symbols.push(symbolObj);
                        }
                    }
                    var upLength = _symbols.length;
                    for (var i = 0; i < downs.length; ++i) {
                        var symbolObj = {};
                        for (var j = upLength; j < _symbols.length; ++j) {
                            if (_symbols[j].symbol == downs[i].symbol && _symbols[j].regulation == "Down") {
                                _symbols[j].count++;
                                break;
                            }
                        }
                        if (j >= _symbols.length) {
                            symbolObj.gene_id = downs[i].gene_id;
                            symbolObj.symbol = downs[i].symbol;
                            symbolObj.count = 1;
                            symbolObj.ratio = parseFloat(downs[i].ratio).toFixed(5);
                            symbolObj.regulation = "Down";
                            _symbols.push(symbolObj);
                        }
                    }
                    var bubble = new PATHBUBBLES.Table(_this.parent.x + _this.parent.offsetX + _this.parent.w - 40, _this.parent.y + _this.parent.offsetY, 500, 500, d3.select(this).datum().dbId, _symbols);
                    bubble.name = "(Expression) " + d3.select(this).datum().name;
                    bubble.addHtml();
                    bubble.table.keepQuery = true;
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

                function computeRotation(d, i) {
                    var angle = x(d.dx + d.d_dx / 2) - Math.PI / 2;
                    return angle / Math.PI * 180;
                }

                function mouseovered(d) {
                    node
                        .each(function (n) {
                            n.target = n.source = false;
                        });

                    link
                        .classed("link--target", function (l) {
                            if (l.target === d) return l.source.source = true;
                        })
                        .classed("link--source", function (l) {
                            if (l.source === d) return l.target.target = true;
                        })
                        .filter(function (l) {
                            return l.target === d || l.source === d;
                        })
                        .each(function () {
                            this.parentNode.appendChild(this);
                        });

                    node
                        .classed("node--target", function (n) {
                            return n.target;
                        })
                        .classed("node--source", function (n) {
                            return n.source;
                        });
                }

                function mouseouted(d) {
                    link
                        .classed("link--target", false)
                        .classed("link--source", false);

                    node
                        .classed("node--target", false)
                        .classed("node--source", false);
                }

                function processLinks(nodes, classes) {
                    var imports = [];
                    var _nodes = [];
                    for (var i = 0; i < nodes.length; ++i) {
                        if (nodes[i].depth == _this.showCrossTalkLevel) {
                            var dx = nodes[i].x;
                            var dy = nodes[i].y;
                            var d_dx = nodes[i].dx;
                            var d_dy = nodes[i].dy;
                            var temp = {};
                            temp.x = Math.sin(
                                    Math.PI - (Math.max(0, Math.min(2 * Math.PI, x(dx)))
                                    + Math.max(0, Math.min(2 * Math.PI, x(dx + d_dx)))) / 2
                            )
                                * Math.max(0, y(dy));
                            temp.y = Math.cos(
                                    Math.PI - (Math.max(0, Math.min(2 * Math.PI, x(dx)))
                                    + Math.max(0, Math.min(2 * Math.PI, x(dx + d_dx)))) / 2
                            )
                                * Math.max(0, y(dy));
                            temp.name = nodes[i].name;
                            temp.parent = nodes[i].parent;
                            temp.depth = nodes[i].depth;
                            temp.dbId = nodes[i].dbId;
                            temp.children = nodes[i].children;

                            temp.dx = nodes[i].x;
                            temp.dy = nodes[i].y;
                            temp.d_dx = nodes[i].dx;
                            temp.d_dy = nodes[i].dy;
                            temp.symbols = nodes[i].symbols;
                            temp.gallusOrth = nodes[i].gallusOrth;
                            if (_this.customExpression) {
                                temp.expression = nodes[i].expression;
                            }

                            _nodes.push(temp);
                        }
                    }
                    for (var i = 0; i < classes.length; ++i) {
                        var source;
                        var targets = [];
                        if (classes[i].imports.length != 0) {
                            for (var ii = 0; ii < _nodes.length; ++ii) {
                                if (classes[i].name == _nodes[ii].name) {
                                    source = _nodes[ii];
                                }
                                for (var ij = 0; ij < classes[i].imports.length; ++ij) {
                                    if (classes[i].imports[ij] == _nodes[ii].name) {
                                        targets.push(_nodes[ii]);
                                    }
                                }
                            }
                        }
                        for (var ijk = 0; ijk < targets.length; ++ijk) {
                            var importObj = {};
                            importObj.source = source;
                            importObj.target = targets[ijk];
                            imports.push(importObj);
                        }
                    }
                    return {imports: imports, nodes: _nodes};
                }

                function rightClick(d, i) {
                    if (i == 0)
                        return;
                    var dbId = d3.select(this).datum().dbId;
                    var bubble = new PATHBUBBLES.Table(_this.parent.x + _this.parent.offsetX + _this.parent.w - 40, _this.parent.y + _this.parent.offsetY, 500, 500, dbId);
                    bubble.name = d3.select(this).datum().name;
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

                function click(d, i) {
                    if (i == 0 || d.children == undefined)
                        return;
                    if (d.children.length == 0)
                        return;
                    var selectedData = d3.select(this).datum();
                    var name = selectedData.name;
                    var dataType = $('#menuView' + _this.parent.id).find('#file').val();

                    var RingWidth = _this.parent.w;
                    var RingHeight = _this.parent.h;
                    if (d3.select(this).datum().depth >= 1) {
                        RingWidth = RingWidth * 0.8;
                        RingHeight = RingHeight * 0.8;
                    }
                    var bubble5 = new PATHBUBBLES.TreeRing(_this.parent.x + _this.parent.offsetX + _this.parent.w - 40, _this.parent.y + _this.parent.offsetY, RingWidth, RingHeight, name, dataType, selectedData);
                    bubble5.HIDE = _this.parent.HIDE;
                    bubble5.addHtml();

                    if (_this.customOrtholog) {
                        bubble5.treeRing.customOrtholog = _this.customOrtholog;
                        $('#menuView' + bubble5.id).find("#minRatio").val($('#menuView' + _this.parent.id).find("#minRatio").val());
                        $('#menuView' + bubble5.id).find("#maxRatio").val($('#menuView' + _this.parent.id).find("#maxRatio").val());
                        $('#menuView' + bubble5.id).find("#crossTalkLevel").val($('#menuView' + _this.parent.id).find("#crossTalkLevel").val());
                        $('#menuView' + bubble5.id).find("#file").val($('#menuView' + _this.parent.id).find("#file").val());
                    }
                    if (_this.customExpression) {
                        d3.select("#svg" + bubble5.id).selectAll(".symbol").remove();
                        bubble5.treeRing.customExpression = _this.customExpression;
                        bubble5.treeRing.expressionScaleMax = max;
                        $('#menuView' + bubble5.id).find("#minRatio").val($('#menuView' + _this.parent.id).find("#minRatio").val());
                        $('#menuView' + bubble5.id).find("#maxRatio").val($('#menuView' + _this.parent.id).find("#maxRatio").val());
                        $('#menuView' + bubble5.id).find("#crossTalkLevel").val($('#menuView' + _this.parent.id).find("#crossTalkLevel").val());
                        $('#menuView' + bubble5.id).find("#file").val($('#menuView' + _this.parent.id).find("#file").val());
                    }

                    bubble5.menuOperation();
                    if (viewpoint) {
                        bubble5.offsetX = viewpoint.x;
                        bubble5.offsetY = viewpoint.y;
                    }
                    scene.addObject(bubble5);
                    if (!_this.parent.GROUP) {
                        var group = new PATHBUBBLES.Groups();
                        group.objectAddToGroup(_this.parent);
                        group.objectAddToGroup(bubble5);
                        scene.addObject(group);
                    }
                    else {
                        if (_this.parent.parent instanceof  PATHBUBBLES.Groups) {
                            _this.parent.parent.objectAddToGroup(_this.parent);
                            _this.parent.parent.objectAddToGroup(bubble5);
                            scene.addObject(_this.parent.parent);
                        }
                    }
                }
            });
            if (_this.parent.HIDE==undefined ||_this.parent.HIDE!==true) {     //Color Bar for ortholog

                var scaleMargin = {top: 5, right: 5, bottom: 5, left: 5},
                    scaleWidth = 30 - scaleMargin.left - scaleMargin.right,
                    scaleHeight = 170 - scaleMargin.top - scaleMargin.bottom;
                var BarWidth = scaleWidth + scaleMargin.left + scaleMargin.right;
                var BarHeight = scaleHeight + scaleMargin.top + scaleMargin.bottom;

                var sectionHeight = 20;
                var texts = ["Partial","Complete","Empty"];
                var newData = [];
                for (var i = 0; i< 3; i++) {
                    var obj = {};
                    obj.data = i*20;
                    obj.text = texts[i];
                    obj.color = colors[i];
                    newData.push(obj);
                }
                var colorScaleBar = svg.append("g")
                    .attr("class", "colorScaleBar")
                    .attr("transform", "translate(" + (width - 30-33) + "," + (  0  ) + ")")
                    .attr("width", BarWidth)
                    .attr("height", BarHeight);

                colorScaleBar.selectAll('rect')
                    .data(newData)
                    .enter()
                    .append('rect')
                    .attr("x", 0)
                    .attr("y", function (d) {
                        return d.data;
                    })
                    .attr("height", sectionHeight)
                    .attr("width", scaleWidth)

                    .attr('fill', function (d) {
                        return d.color;
                    });
                colorScaleBar.selectAll('text')
                    .data(newData)
                    .enter().append("text")
                    .style("font-size", 10)
                    .attr("transform", "translate(" + (scaleWidth / 2 + 10) + "," + (sectionHeight) + ")")
                    .attr("y", function (d, i) {
                        return d.data - 5;
                    })
                    .attr("dy", ".1em")
                    .style("text-anchor", "start")
                    .text(function (d, i) {
                        return d.text;
                    });
            }
        }

        d3.select(self.frameElement).style("height", height + "px");
    }
};

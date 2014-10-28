/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/10/2014
 * @name        PathBubble_D3Ring
 */
PATHBUBBLES.D3Ring = function(parent, defaultRadius, functionType, dataType, name){
    this.parent = parent;
    this.defaultRadius = defaultRadius;
    this.name = name ||null;
    this.file = "./data/"+ functionType +"/" + dataType + "/"+name+ ".json";
};
PATHBUBBLES.D3Ring.prototype = {
    constructor: PATHBUBBLES.D3Ring,
    init: function(type){
        var width = this.defaultRadius,
            height = this.defaultRadius,
            radius = Math.min(width, height) / 2;
        var ShowLevel = 1;

        var x = d3.scale.linear()
            .range([0, 2 * Math.PI]);


        var y = d3.scale.sqrt()
            .range([0, radius]);

        var color = d3.scale.category20c();

        var svg = d3.select("#svg"+this.parent.id).append("svg")
            .attr("width", width)
            .attr("height", this.parent.h);
        if(type !== "Expression")
        {
            var colors = ["#fdae6b", "#a1d99b", "#bcbddc"];
            var symbol =svg.append("g")
                .attr("class", "symbol")
                .attr("transform", "translate(" +(width/2-75) + "," + (height + 5 ) + ")")
                .attr("width", 150)
                .attr("height", 20);
            var color1 = symbol.append("g");
            color1.attr("class", "color1")
                .append("rect")
                .attr("width", 50)
                .attr("height", 20)
                .style("stroke", colors[0])
                .style("fill",colors[0]);
            color1.append("text")
                .attr("x",0)
                .attr("y", 13)
                .style("text-anchor", "start")
                .style("font-size", 10)
                .style("fill", "#000")
                .text("Partial");

            var color2 = symbol.append("g");
            color2.append("rect").attr("width", 50).attr("transform", "translate(" + 50 + "," + 0 + ")")
                .attr("height", 20)
                .style("stroke", colors[1])
                .style("fill",colors[1]);
            color2.append("text")
                .attr("x",50)
                .attr("y", 13)
                .style("text-anchor", "start")
                .style("font-size", 10)
                .style("fill", "#000")
                .text("Complete");
            var color3 = symbol.append("g");
            color3.append("rect").attr("width", 50).attr("transform", "translate(" + 100 + "," + 0 + ")")
                .attr("height", 20)
                .style("stroke", colors[2])
                .style("fill",colors[2]);
            color3.append("text")
                .attr("y", 13)
                .attr("x",100)
                .style("text-anchor", "start")
                .style("font-size", 10)
                .style("fill", "#000")
                .text("Empty");
        }

        svg = svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + (height / 2 ) + ")");

        var partition = d3.layout.partition()
            .value(function(d) { return d.size; });
        var innerRingRadius = 0;
        var arc = d3.svg.arc()
            .startAngle(function(d) {
                return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
            .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
            .innerRadius(function(d) {
                return Math.max(0, y(d.y));
            })
            .outerRadius(function(d) {
                innerRingRadius = Math.max(0, y(d.y + d.dy));
                return Math.max(0, y(d.y + d.dy));
            });

        var tooltip = d3.select("#svg"+this.parent.id)
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
        var nodeData ;
        //edge ----------------------------------------------------------------------------
        var bundle = d3.layout.bundle();
        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.x, d.y]; });
        var _this =this;
//        if(!this.data)
//        {
            d3.json(_this.file, function(error, root) {
                operation(root);
            });
//        }
//        else
//        {
//             operation(this.data);
//        }
        function operation(root){
            nodeData = partition.nodes(root);
            _this.parent.name = nodeData[0].name + " "+_this.parent.name;

//            var crossTalkFileName = "./data/data.json";
            var crossTalkFileName = "./data/crossTalkData/" + root.name + ".json";
            d3.json(crossTalkFileName, function(error, classes) {
//                var classes = crossTalkData[ShowLevel -1];
//                d3.json(crossTalkFileName, function(error, crossTalkData) {
//                    var classes = crossTalkData[ShowLevel -1];

                var gGroup = svg.append("g").attr("class", "graphGroup");
                var pathG = gGroup.append("g").selectAll(".path");
                var textG = gGroup.append("g").selectAll(".text");
                var bundleGroup = svg.append("g").attr("class", "bundleGroup");
                var link = bundleGroup.append("g").selectAll(".link");
                var node = bundleGroup.append("g").selectAll(".node");

//                var g = svg.selectAll("g")
//                    .data(nodeData)
//                    .enter().append("g");
                if(type == "Expression")
                {
                    var sum=0;
                    var max = d3.max(nodeData, function(d) {
                        if(d.name=="homo sapiens")
                            return;
                        var temp = d.downs.length + d.ups.length;
                        sum +=temp;
                        return temp;
                    });
                    var divisions = 20;

                    var scaleMargin = {top: 5, right: 5, bottom: 5, left: 5},
                        scaleWidth = 170 - scaleMargin.left - scaleMargin.right,
                        scaleHeight = 30 - scaleMargin.top - scaleMargin.bottom;

                    var newData = [];
                    var sectionWidth = Math.floor(scaleWidth / divisions);

                    for (var i=0; i < scaleWidth; i+= sectionWidth ) {
                        newData.push(i);
                    }

                    var colorScaleLin = d3.scale.linear()
                        .domain([0, newData.length-1])
                        .interpolate(d3.interpolateRgb)
                        .range([d3.rgb(243,247,213), d3.rgb(33,49,131)]);

                    var BarWidth = scaleWidth + scaleMargin.left + scaleMargin.right;
                    var BarHeight = scaleHeight + scaleMargin.top + scaleMargin.bottom;
                    var colorScaleBar = svg.append("g")
                        .attr("class", "colorScaleBar")
                        .attr("transform", "translate(" +(0-BarWidth/2) + "," + height/2 + ")")
                        .attr("width", BarWidth)
                        .attr("height", BarHeight );
//                    .attr("transform", "rotate(-90)");

                    var xScale = d3.scale.linear()
                        .domain([0, max/sum])
                        .range([0, scaleWidth]);

                    var colorRange  = d3.scale.linear()
                        .domain([0, max/sum])
                        .interpolate(d3.interpolateRgb)
                        .range([d3.rgb(243,247,213), d3.rgb(33,49,131)]);

                    var xAxis = d3.svg.axis()
                        .scale(xScale);

                    colorScaleBar.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + (scaleHeight+3) + ")")
                        .call(xAxis)
                        .selectAll("text")
                        .attr("y", 0)
                        .attr("x", 8)
                        .attr("dy", ".1em")
                        .attr("transform", "rotate(90)")
                        .style("text-anchor", "start");

                    colorScaleBar.selectAll('rect')
                        .data(newData)
                        .enter()
                        .append('rect')
                        .attr("x", function(d) { return d; })
                        .attr("y", 0)
                        .attr("height", scaleHeight)
                        .attr("width", sectionWidth)
                        .attr('fill', function(d, i) { return colorScaleLin(i)});
                }


//                var path = g.append("path")
                pathG = pathG.data(nodeData)
                    .enter().append("path")
//                pathG.append("path")
                    .attr("id", function (d, i) {
                        return "group" + i;
                    })
                    .attr("d", arc)
                    .style("fill", function (d,i) {
                        if(type != "Expression") {
                            if(d.children !== undefined)
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
                        else if( type == "Expression")
                        {
                            if(d.downs== undefined)
                                return "#fff";
                            else
                            {
                                if(sum!==0)
                                {
                                    return colorRange((d.downs.length + d.ups.length)/sum);
                                }
                                else
                                {
                                    return colorRange(0);
                                }
                            }

                        }
                    })
                    .style("cursor", "pointer")
                    .on("contextmenu", rightClick)
                    .on("click", click)
                    .on("mouseover", function (d,i) {
                        if(d.name=="homo sapiens")
                            return;
                        tooltip.html(function () {
                            return format_name(d);
                        });
                        return tooltip.transition()
                            .duration(50)
                            .style("opacity", 0.9);
                    })
                    .on("mousemove", function (d,i) {
                        if(d.name=="homo sapiens")
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

                textG = textG.data(nodeData)
                    .enter().append("text")
//                var text = g.append("text")
                    .attr("x", function (d) {
                        return y(d.y);
                    })
                    .attr("dx", "6") // margin
                    .attr("dy", ".35em") // vertical-align
                    .style("font-size", 10)
                    .text(function (d,i) {
                        if(i==0)
                           return d.name;
                        var str = d.name;
                        str = str.match(/\b\w/g).join('');
                        str = str.substr(0, 4);
                        if (d.depth < 3)
                            return str;
                        else
                            return "";
                    })
                    .on("contextmenu", rightClick)
                    .on("click", click)
                    .on("mouseover", function (d) {
                        tooltip.html(function () {
                            return format_name(d);
                        });
                        return tooltip.transition()
                            .duration(50)
                            .style("opacity", 0.9);
                    });

                function computeTextRotation(d, i) {
                    if (i == 0)
                        return 0;
                    var angle = x(d.x + d.dx / 2) - Math.PI / 2;
                    return angle / Math.PI * 180;
                }

                textG.attr("transform", function (d, i) {
                    return "rotate(" + computeTextRotation(d, i) + ")";
                });



                var objects = processLinks(nodeData, classes);
                var links= objects.imports;
                 if(type != "Expression")
                 {
                     var simbol_max = d3.max(objects.nodes, function(d) {
                         var temp =0;
                         if(d.simbols!==undefined)
                             temp =d.simbols.length;
                         return temp;
                     });
                 }
                else if(type == "Expression")
                {
                    var up_max = d3.max(objects.nodes, function(d) {
                        var temp =0;
                        if(d.ups!==undefined)
                            temp =d.ups.length;
                        return temp;
                    });
                    var down_max = d3.max(objects.nodes, function(d) {
                        var temp =0;
                        if(d.downs!==undefined)
                            temp =d.downs.length;
                        return temp;
                    });
                }


                var _nodes = objects.nodes;
                link = link
                    .data(bundle(links))
                    .enter().append("path")
                    .each(function (d) {
                        d.source = d[0];
                        d.target = d[d.length - 1];
                    })
                    .attr("class", "link")
                    .attr("d", diagonal);
                if(type != "Expression")
                {
                    node = node
                        .data(_nodes)
                        .attr("id", function(d,i){
                            return "node" + d.dbId;
                        })
                        .enter().append("rect")
                        .attr("class", "node")
                        .attr("x", function (d) {
                            return y(d.dy);
                        })
                        .attr("y", function (d) {
                            return -5;
                        })
                        .attr("height", 10)
                        .attr("width", function(d){
                            var temp=0;
                            if(d.simbols!==undefined)
                                temp = d.simbols.length;
                            return temp/simbol_max * 40+3;
                        })
                        .attr("transform", function (d, i) {
                            return "rotate(" + computeRotation(d, i) + ")";
                        })
                        .style("fill",   "#f00")
                        .on("contextmenu", barClick)
                        .on("mouseover", mouseovered)
                        .on("mouseout", mouseouted);

                    function barClick(){
                        var simbols = d3.select(this).datum().simbols;
                        var _simbols = [];
                        for(var i=0; i<simbols.length; ++i)
                        {   var simbolObj ={};
                            for(var j=0;j<_simbols.length; ++j)
                            {
                                if(_simbols[j].name == simbols[i])
                                {
                                    break;
                                }
                            }
                            if(j>=_simbols.length)
                            {
                                simbolObj.name = simbols[i];
                                simbolObj.count =1;
                                _simbols.push(simbolObj);
                            }
                            else
                            {
                                _simbols[j].count ++;
                            }
                        }
                        var bubble = new PATHBUBBLES.Table(_this.parent.x + _this.parent.offsetX + _this.parent.w - 40, _this.parent.y + _this.parent.offsetY, 230, 500, null, _simbols);
                        bubble.name = "(Shared protein) "+d3.select(this).datum().name;
                        bubble.addHtml();
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
                }
                else
                {
//                    node = node
//                        .data(_nodes)
//                        .attr("id", function(d,i){
//
//                            return "node" + d.dbId;
//                        })
//                        .enter().append("circle")
//                        .attr("class", "node")
//                        .attr("r", 5)
//                        .attr("cx", function(d) {
//                            return d.x;
//                        })
//                        .attr("cy", function(d) {
//                            return d.y;
//                        })
//                        .style("fill",   "#f00")
//                        .on("mouseover", mouseovered)
//                        .on("mouseout", mouseouted);

                    node = node
                        .data(_nodes)
                        .attr("id", function(d,i){
                            return "nodeUp" + d.dbId;
                        })
                        .enter().append("rect")
                        .attr("class", "node")
                        .attr("x", function (d) {
                            return y(d.dy);
                        })
                        .attr("y", function (d) {
                            return -5;
                        })
                        .attr("height", 10)
                        .attr("width", function(d){
                            if(d.ups==undefined)
                                return 3;
                            else
                            {
                                var temp=0;
                               if(up_max!==0)
                               {
                                   temp = d.ups.length;
                                   return temp/up_max * 40+3;
                               }
                               else
                               {
                                   return 3;
                               }
                            }

                        })
                        .attr("transform", function (d, i) {
                            return "rotate(" + computeRotation(d, i) + ")";
                        })
                        .style("fill",   "#f00")
                        .on("contextmenu", expressionBarClick)
                        .on("mouseover", mouseovered)
                        .on("mouseout", mouseouted);

                    function expressionBarClick(){
                        var ups = d3.select(this).datum().ups;
                        var downs = d3.select(this).datum().downs;
                        var _simbols = [];
                        for(var i=0; i<ups.length; ++i)
                        {   var simbolObj ={};
                            for(var j=0;j<_simbols.length; ++j)
                            {
                                if(_simbols[j].SimbolName == ups[i] && _simbols[j].type == "Up")
                                {
                                    _simbols[j].count ++;
                                    break;
                                }
                            }
                            if(j>=_simbols.length)
                            {
                                simbolObj.SimbolName = ups[i];
                                simbolObj.count =1;
                                simbolObj.type = "Up";
                                _simbols.push(simbolObj);
                            }
                        }
                        var upLength = _simbols.length;
                        for(var i=0; i<downs.length; ++i)
                        {   var simbolObj ={};
                            for(var j=upLength;j<_simbols.length; ++j)
                            {
                                if(_simbols[j].SimbolName == downs[i] && _simbols[j].type == "Down")
                                {
                                    _simbols[j].count ++;
                                    break;
                                }
                            }
                            if(j>=_simbols.length)
                            {
                                simbolObj.SimbolName = downs[i];
                                simbolObj.count =1;
                                simbolObj.type = "Down";
                                _simbols.push(simbolObj);
                            }
                        }
                        var bubble = new PATHBUBBLES.Table(_this.parent.x + _this.parent.offsetX + _this.parent.w - 40, _this.parent.y + _this.parent.offsetY, 320, 500, null, _simbols);
                        bubble.name = "(Expression) "+d3.select(this).datum().name;
                        bubble.addHtml();
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

                }


                function computeRotation(d, i) {
                    var angle = x(d.dx + d.d_dx / 2) - Math.PI / 2;
                    return angle / Math.PI * 180;
                }
                function mouseovered(d) {
                    node
                        .each(function(n) { n.target = n.source = false; });

                    link
                        .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
                        .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
                        .filter(function(l) { return l.target === d || l.source === d; })
                        .each(function() { this.parentNode.appendChild(this); });

                    node
                        .classed("node--target", function(n) { return n.target; })
                        .classed("node--source", function(n) { return n.source; });
                }
                function mouseouted(d) {
                    link
                        .classed("link--target", false)
                        .classed("link--source", false);

                    node
                        .classed("node--target", false)
                        .classed("node--source", false);
                }
                function processLinks(nodes,classes)
                {
                    var imports = [];
                    var _nodes = [];
                    for(var i=0; i<nodes.length; ++i)
                    {
                        if(nodes[i].depth ==ShowLevel)
                        {
                            var dx = nodes[i].x;
                            var dy= nodes[i].y;
                            var d_dx = nodes[i].dx;
                            var d_dy = nodes[i].dy;
                            var temp = {};
                            temp.x = Math.sin(
                                    Math.PI -  (Math.max(0, Math.min(2 * Math.PI, x(dx)))
                                    + Math.max(0, Math.min(2 * Math.PI, x(dx + d_dx))))/2
                            )
                                *Math.max(0, y(dy));
                            temp.y = Math.cos(
                                    Math.PI -  (Math.max(0, Math.min(2 * Math.PI, x(dx)))
                                    + Math.max(0, Math.min(2 * Math.PI, x(dx + d_dx))))/2
                            )
                                *Math.max(0, y(dy));
                            temp.name = nodes[i].name;
                            temp.parent = nodes[i].parent;
                            temp.depth = nodes[i].depth;
                            temp.children = nodes[i].children;
                            if(type != "Expression")
                            {
                                temp.dx = nodes[i].x;
                                temp.dy = nodes[i].y;
                                temp.d_dx = nodes[i].dx;
                                temp.d_dy = nodes[i].dy;
                                temp.simbols = nodes[i].simbols;
                            }
                            else if(type == "Expression")
                            {
                                temp.dx = nodes[i].x;
                                temp.dy = nodes[i].y;
                                temp.d_dx = nodes[i].dx;
                                temp.d_dy = nodes[i].dy;
                                temp.downs = nodes[i].downs;
                                temp.ups = nodes[i].ups;
                            }

                            _nodes.push(temp);
                        }
                    }
                    for(var i=0; i<classes.length; ++i)
                    {
                        var source;
                        var targets = [];
                        if(classes[i].imports.length != 0)
                        {
                            for(var ii=0; ii<_nodes.length; ++ii)
                            {
                                if(classes[i].name == _nodes[ii].name)
                                {
                                    source = _nodes[ii];
                                }
                                for(var ij=0; ij<classes[i].imports.length; ++ij)
                                {
                                    if(classes[i].imports[ij] == _nodes[ii].name)
                                    {
                                        targets.push( _nodes[ii] );
                                    }
                                }
                            }
                        }
                        for(var ijk=0; ijk<targets.length; ++ijk)
                        {
                            var importObj={};
                            importObj.source = source;
                            importObj.target = targets[ijk];
                            imports.push(importObj);
                        }
                    }
                    return {imports: imports, nodes: _nodes};
                }
                function rightClick(d,i) {
                    if(i==0)
                        return;
                    var dbId = d3.select(this).datum().dbId;
                    var bubble = new PATHBUBBLES.Table(_this.parent.x + _this.parent.offsetX + _this.parent.w - 40, _this.parent.y + _this.parent.offsetY, 500, 500, dbId);
                    bubble.name = d3.select(this).datum().name;
                    bubble.addHtml();
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

                function click(d,i) {
                    if(i==0)
                        return;
//                    var data = d3.select(this).datum();
                    var name = d3.select(this).datum().name;
                    type = $('#menuView'+ _this.parent.id).children('#type').val();
                    if(type == "Expression")
                    {
                        var dataType = $('#menuView'+ _this.parent.id).children('#expressionFile').val();
                    }
                    else if(type == "Ortholog")
                    {
                        var dataType = $('#menuView'+ _this.parent.id).children('#file').val();
                    }
                    var RingWidth = _this.parent.w;
                    var RingHeight = _this.parent.h;
                    if(d3.select(this).datum().depth >=1)
                    {
                        RingWidth = RingWidth*0.8;
                        RingHeight = RingHeight*0.8;
                    }
                    var bubble5 = new PATHBUBBLES.TreeRing(_this.parent.x + _this.parent.offsetX + _this.parent.w - 40, _this.parent.y + _this.parent.offsetY, RingWidth, RingHeight, name,type,dataType);
                    bubble5.addHtml();
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

                function doubleClick(d) {
                    path.transition()
                        .duration(1500)
                        .attrTween("d", arcTween(d))
                        .each("end", function (e, i) {
                            // check if the animated element's data e lies within the visible angle span given in d
                            if (e.x >= d.x && e.x < (d.x + d.dx)) {
                                // get a selection of the associated text element
                                var arcText = d3.select(this.parentNode).select("text");
                                // fade in the text element and recalculate positions
                                arcText.transition().duration(750)
                                    .attr("opacity", 1)
                                    .attr("transform", function () {
                                        return "rotate(" + computeTextRotation(e) + ")"
                                    })
                                    .attr("x", function (d) {
                                        return y(d.y);
                                    });
                            }
                        });

                }
            });
        }

        d3.select(self.frameElement).style("height", height + "px");

        // Interpolate the scales!
        function arcTween(d) {
            var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                yd = d3.interpolate(y.domain(), [d.y, 1]),
                yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
            return function(d, i) {
                return i
                    ? function(t) { return arc(d); }
                    : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
            };
        }
    }
};

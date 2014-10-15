/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/10/2014
 * @name        PathBubble_D3Ring
 */
PATHBUBBLES.D3Ring = function(parent,defaultRadius, data){
    this.parent = parent;
    this.defaultRadius = defaultRadius;
    this.data = data ||null;

};
PATHBUBBLES.D3Ring.prototype = {
    constructor: PATHBUBBLES.D3Ring,
    init: function(){
        var width = this.defaultRadius,
            height = this.defaultRadius,
            radius = Math.min(width, height) / 2;

        var x = d3.scale.linear()
            .range([0, 2 * Math.PI]);

        var y = d3.scale.sqrt()
            .range([0, radius]);

        var color = d3.scale.category20c();

        var svg = d3.select("#svg"+this.parent.id).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + (height / 2 ) + ")");

        var partition = d3.layout.partition()
            .value(function(d) { return d.size; });

        var arc = d3.svg.arc()
            .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
            .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
            .innerRadius(function(d) { return Math.max(0, y(d.y)); })
            .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

        var tooltip = d3.select("#svg"+this.parent.id)
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("opacity", 0);

        function format_number(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        function format_name(d) {
            var name = d.name;
            return  '<b>' + name + '</b>';
        }
        var flag = true;
        var _this =this;
        if(!this.data)
        {
            d3.json("./d3lib/pathwayHierarchy.json", function(error, root) {
                operation(root);
            });
        }
        else
        {
             operation(this.data);
        }
        function operation(root){
            var path = svg.selectAll("path")
                .data(partition.nodes(root))
                .enter().append("path")
                .attr("d", arc)
                .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
                .style("cursor", "pointer")
                .on("click",click)
                .on("dblclick", doubleClick)
                .on("mouseup", mouseUp)
                .on("mouseover", function(d) {
                    tooltip.html(function() {
                        return format_name(d);
                    });
                    return tooltip.transition()
                        .duration(50)
                        .style("opacity", 0.9);
                })
                .on("mousemove", function(d) {
                    return tooltip
                        .style("top", (d3.event.pageY-10-_this.parent.y -_this.parent.offsetY )+"px")
                        .style("left", (d3.event.pageX+10-_this.parent.x -_this.parent.offsetX)+"px");
                })
                .on("mouseout", function(){return tooltip.style("opacity", 0);});
            svg.on("mouseout", function(){return tooltip.html("");});
            function click(d){
                var data = d3.select(this).datum();
                var bubble5 = new PATHBUBBLES.TreeRing(_this.parent.x + _this.parent.offsetX + _this.parent.w-40, _this.parent.y + _this.parent.offsetY,730,730, data);
                bubble5.addHtml();
                bubble5.menuOperation();
                scene.addObject(bubble5);
                if(!_this.parent.GROUP)
                {
                    var group= new PATHBUBBLES.Groups();
                    group.objectAddToGroup(_this.parent);
                    group.objectAddToGroup(bubble5);
                    scene.addObject(group);
                }
                else
                {
                    if(_this.parent.parent instanceof  PATHBUBBLES.Groups)
                    {
                        _this.parent.parent.objectAddToGroup(_this.parent);
                        _this.parent.parent.objectAddToGroup(bubble5);
                        scene.addObject(_this.parent.parent);
                    }
                }
            }
            function mouseUp(d){
                flag = true;
                path.style("cursor", "auto");
            }
            function doubleClick(d) {
                path.transition()
                    .duration(1500)
                    .attrTween("d", arcTween(d));
            }
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

/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/10/2014
 * @name        PathBubble_TreeRing
 */

PATHBUBBLES.TreeRing = function (x, y, w, h, dataName, functionType, dataType, selectedData) {
    PATHBUBBLES.Object2D.call(this);
    this.type = "TreeRing";
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 500;
    this.h = h || 530;
    this.strokeColor = "#00ffff";
    this.fillColor = "#ffffff";
    this.cornerRadius = 20;
    this.lineWidth = 10;

    this.shape = new PATHBUBBLES.Shape.Rectangle(this, this.x, this.y, this.w, this.h, this.strokeColor, this.fillColor, this.lineWidth, this.cornerRadius);
    this.menu = new PATHBUBBLES.Shape.Circle(this.x + this.w - this.cornerRadius / 2, this.y + this.cornerRadius / 2, this.lineWidth, "#ff0000", this.strokeColor, 1) || null;
//    this.menuBar = new PATHBUBBLES.Menu(this);
    this.button = new PATHBUBBLES.Button(this);   //Button 0 for file selection
    var tmp = '';
    tmp += '<select id="type" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 'px; ">';
    tmp += '<option value="Ortholog">Ortholog</option>';
    tmp += '<option value="Expression">Expression</option>';
    tmp += '</select>';
    tmp += '<select id="file" style="position: absolute; left:' + this.x + ' px; top:' + this.y+25 + 'px; ">';
    tmp += '<option value="Gallus">Gallus</option>';
    tmp += '<option value="Alligator">Alligator</option>';
    tmp += '<option value="Turtle">Turtle</option>';
    tmp += '</select>';
    tmp += '<select id="expressionFile" style="position: absolute; left:' + this.x + ' px; top:' + this.y+25 + 'px; display: none">';
    tmp += '<option value="lib15-Heat0">lib15-Heat0</option>';
    tmp += '<option value="TGF0">TGF0</option>';
    tmp += '</select>';
    tmp += '<input type="file" id=customOrth style="position: absolute; left:' + this.x + ' px; top:' + this.y + 'px; ">';
    tmp += '<input type="button" id=loadOrth value= "Load" style="position: absolute; left:' + this.x + ' px; top:' + this.y + 25 + 'px; ">';
    tmp += '<input type="button" id=ungroup value= "Ungroup" style="position: absolute; left:' + this.x + ' px; top:' + this.y+50 + 'px; ">';
    tmp += '<input type="button" id=delete value= "Delete" style="position: absolute; left:' + this.x + ' px; top:' + this.y+75 + 'px; ">';
    tmp += '<select id="crossTalkLevel" style="position: absolute; left:' + this.x + ' px; top:' + this.y+25 + 'px; ">';
    tmp += '</select>';
    this.button.addButton(tmp);

    this.pre = "(Ortholog) Human VS ";
    this.name = this.pre + "Gallus";
    this.title = new PATHBUBBLES.Title(this,this.name);
    this.__objectsAdded = [];
    this.__objectsRemoved = [];
    this.center = {x: this.x + this.w / 2, y: this.y + this.h / 2};
    this.GROUP = false;
    this.selected_file = null;
    this.dataName = dataName||null;
    this.functionType = functionType||"Ortholog";
    this.dataType = dataType||null;
    this.selectedData = selectedData||null;
};

PATHBUBBLES.TreeRing.prototype = Object.create(PATHBUBBLES.Object2D.prototype);

PATHBUBBLES.TreeRing.prototype = {
    constructor: PATHBUBBLES.TreeRing,
    addHtml: function(){
        this.setOffset();
        var tmp = '';
        tmp += '<div id= svg'+ this.id+' style="position: absolute; width:'+ (this.w + 5)+'px; ' + 'height:'+ (this.h +5) + 'px; left:' + (this.shape.x + this.offsetX) + ' px; top:' + (this.shape.y+this.offsetY) + 'px; "> </div>';
        $("#bubble").append( $(tmp) );
        var $menuBarbubble = $('#menuView'+ this.id);
        $menuBarbubble.children('#type').val(this.functionType);


        if(this.functionType == "Ortholog")
        {
            if(!this.dataType)
                this.dataType = "Gallus";
            $menuBarbubble.children('#expressionFile').hide();
            $menuBarbubble.children('#file').show();
            $menuBarbubble.children('#file').val(this.dataType);
            this.name = this.pre + this.dataType;
        }
        else if(this.functionType == "Expression")
        {
            if(!this.dataType)
                this.dataType = "TGF0";
            $menuBarbubble.children('#file').hide();
            $menuBarbubble.children('#expressionFile').show();
            $menuBarbubble.children('#expressionFile').val(this.dataType);
            this.name = "(Expression) "+ this.dataType;
        }
        this.treeRing =  new PATHBUBBLES.D3Ring(this, Math.min(this.w,this.h)-30, this.functionType, this.dataType, this.dataName);
        if(this.selectedData!== undefined && this.selectedData!==null)
        {
            this.treeRing.selectedData = this.selectedData;
        }
        this.treeRing.init(this.functionType);
    },
    addObject: function (object) {
        var index = this.children.indexOf(object);
        if (index > -1) {
            this.children.splice(index, 1);
        }
        this.children.push(object);
    },
    removeObject: function (object) {

        if($('#svg'+ this.id).length)
            $('#svg'+ this.id).remove();
        if($('#menuView'+ this.id).length)
            $('#menuView'+ this.id).remove();
        var index = PATHBUBBLES.objects.indexOf(object);
        if (index !== -1) {
            PATHBUBBLES.objects.splice(index, 1);
        }
        var index = scene.children.indexOf(object);
        if (index !== -1) {
            scene.children.splice(index, 1);
        }
    },
    menuOperation: function(){
        var _this=this;
        var $menuBarbubble = $('#menuView'+ this.id);
        $menuBarbubble.children('#type').change(function() {
            var val = $(this).val();
            if(val == "Expression")
            {
                $menuBarbubble.children('#file').hide();
                $menuBarbubble.children('#customOrth').hide();
                $menuBarbubble.children('#loadOrth').hide();
                $menuBarbubble.children('#expressionFile').show();

                d3.select('#svg'+ _this.id).remove();
                var tmp = '';
                tmp += '<div id= svg'+ _this.id+' style="position: absolute; width:'+ (_this.w + 5)+'px; ' + 'height:'+ (_this.h +5) + 'px; left:' +
                    (_this.x +  _this.w /2 - (Math.min(_this.w,_this.h)-30)/2-10) + ' px; top:' +
                    (_this.y +  _this.h/2 - (Math.min(_this.w,_this.h)-30)/2+50-15) + 'px; "> </div>';
                $("#bubble").append( $(tmp) );
                _this.treeRing=null;
//                _this.treeRing =  new PATHBUBBLES.D3Ring(_this, Math.min(_this.w,_this.h)-30, this.data);
//                _this.treeRing.file = "./data/lib15-Heat0Expression.json";
                var dataType =$('#menuView'+ _this.id).children('#expressionFile').val();
                _this.treeRing =  new PATHBUBBLES.D3Ring(_this, Math.min(_this.w,_this.h)-30, val, dataType, _this.dataName);
                _this.treeRing.file = "./data/" + val+"/" +dataType+"/"+_this.dataName+ ".json";
//                _this.name = "lib15-Heat0Expression";
//                _this.name = _this.dataName+"Expression";
                _this.name = "(Expression) "+ dataType;
                _this.treeRing.init(val);
            }
            else if(val == "Ortholog")
            {
                $menuBarbubble.children('#file').show();
                $menuBarbubble.children('#customOrth').show();
                $menuBarbubble.children('#loadOrth').show();
                $menuBarbubble.children('#expressionFile').hide();
                var value = $menuBarbubble.children('#file').val();
                if(value==undefined)
                    return;
                d3.select('#svg'+ _this.id).remove();
                var tmp = '';
                tmp += '<div id= svg'+ _this.id+' style="position: absolute; width:'+ (_this.w + 5)+'px; ' + 'height:'+ (_this.h +5) + 'px; left:' +
                    (_this.x +  _this.w /2 - (Math.min(_this.w,_this.h)-30)/2-10) + ' px; top:' +
                    (_this.y +  _this.h/2 - (Math.min(_this.w,_this.h)-30)/2+50-15) + 'px; "> </div>';
                $("#bubble").append( $(tmp) );
                _this.treeRing=null;
//                _this.treeRing =  new PATHBUBBLES.D3Ring(_this, Math.min(_this.w,_this.h)-30, this.data);
//                _this.treeRing.file = "./data/hierarchy" + value +"_ortholog.json";
                var dataType =$('#menuView'+ _this.id).children('#file').val();
                _this.treeRing =  new PATHBUBBLES.D3Ring(_this, Math.min(_this.w,_this.h)-30, val, dataType, _this.dataName);
                _this.treeRing.file = "./data/" + val+"/" +dataType+"/"+_this.dataName+ ".json";
                _this.name = _this.pre + val;
                _this.treeRing.init(val);
            }
        });
        $menuBarbubble.children('#expressionFile').change(function() {
            var val = $(this).val();
            if(val==undefined)
                return;
            d3.select('#svg'+ _this.id).remove();
            var tmp = '';
            tmp += '<div id= svg'+ _this.id+' style="position: absolute; width:'+ (_this.w + 5)+'px; ' + 'height:'+ (_this.h +5) + 'px; left:' +
                (_this.x +  _this.w /2 - (Math.min(_this.w,_this.h)-30)/2-10) + ' px; top:' +
                (_this.y +  _this.h/2 - (Math.min(_this.w,_this.h)-30)/2+50-15) + 'px; "> </div>';
            $("#bubble").append( $(tmp) );
            _this.treeRing=null;
//            _this.treeRing =  new PATHBUBBLES.D3Ring(_this, Math.min(_this.w,_this.h)-30, this.data);
//            _this.treeRing.file = "./data/"+val+"Expression.json";
//            _this.name = "(Expression) "+ val;
//            _this.treeRing.init("Expression");
            var functionType =$('#menuView'+ _this.id).children('#type').val();
            _this.treeRing =  new PATHBUBBLES.D3Ring(_this, Math.min(_this.w,_this.h)-30, functionType, val, _this.dataName);
            _this.treeRing.file = "./data/" + functionType+"/" +val+"/"+_this.dataName+ ".json";
            _this.name = "(Expression) "+ val;
            _this.treeRing.init(functionType);
        });

        $menuBarbubble.children('#file').change(function() {
            var val = $(this).val();
            if(val==undefined)
                return;
            d3.select('#svg'+ _this.id).remove();
            var tmp = '';
            tmp += '<div id= svg'+ _this.id+' style="position: absolute; width:'+ (_this.w + 5)+'px; ' + 'height:'+ (_this.h +5) + 'px; left:' +
                (_this.x +  _this.w /2 - (Math.min(_this.w,_this.h)-30)/2-10) + ' px; top:' +
                (_this.y +  _this.h/2 - (Math.min(_this.w,_this.h)-30)/2+50-15) + 'px; "> </div>';
            $("#bubble").append( $(tmp) );
            _this.treeRing=null;

            var functionType =$('#menuView'+ _this.id).children('#type').val();
            _this.treeRing =  new PATHBUBBLES.D3Ring(_this, Math.min(_this.w,_this.h)-30, functionType, val, _this.dataName);
            _this.treeRing.file = "./data/" + functionType+"/" +val+"/"+_this.dataName+ ".json";
            _this.name = _this.pre + val;
            _this.treeRing.init(functionType);
        });
        $menuBarbubble.children('#crossTalkLevel').change(function() {
            var val = $(this).val();

            if(val==undefined)
                return;
            d3.select('#svg'+ _this.id).remove();
            var tmp = '';
            tmp += '<div id= svg'+ _this.id+' style="position: absolute; width:'+ (_this.w + 5)+'px; ' + 'height:'+ (_this.h +5) + 'px; left:' +
                (_this.x +  _this.w /2 - (Math.min(_this.w,_this.h)-30)/2-10) + ' px; top:' +
                (_this.y +  _this.h/2 - (Math.min(_this.w,_this.h)-30)/2+50-15) + 'px; "> </div>';
            $("#bubble").append( $(tmp) );
            _this.treeRing=null;

            var functionType =$('#menuView'+ _this.id).children('#type').val();
            var fileVal =$('#menuView'+ _this.id).children('#file').val();
            _this.treeRing =  new PATHBUBBLES.D3Ring(_this, Math.min(_this.w,_this.h)-30, functionType, fileVal, _this.dataName);
            _this.treeRing.ChangeLevel = true;
            _this.treeRing.showCrossTalkLevel = val;
            _this.treeRing.file = "./data/" + functionType+"/" +fileVal+"/"+_this.dataName+ ".json";
//            _this.name = _this.pre + val;
            _this.treeRing.init(functionType);
        });

        $menuBarbubble.find('#delete').on('click',function(){
            if(!_this.GROUP)
                _this.deleteBubble();
            else
            {
                var id = _this.id;
                var group = _this.parent;
                _this.GROUP = false;
                var tempdata = [];
                for(var i=0; i<group.children.length; ++i)
                {
                    if(group.children[i].id!==_this.id)
                    {
                        var a =group.children[i];
                        a.parent = undefined;
                        tempdata.push(a);
                    }
                }
                _this.parent = undefined;
                _this.deleteBubble();
                group.tempPoints.length =0;
                group.arranged.length =0;
                group.children.length =0;
                for(var i=0; i<tempdata.length; ++i)
                {
                    group.RESET = true;
                    group.addToGroup(tempdata[i]);
                }
                group.RESET = false;
                scene.addObject(group);
            }
        });
        $menuBarbubble.find('#ungroup').on('click',function(){
            _this.ungroup();
        });
        $menuBarbubble.find('#loadOrth').on('click', function () {
            _this.selected_file = $menuBarbubble.find('#customOrth').get(0).files[0];
            if (!_this.selected_file) {
                alert("Please select data file!");
            }
            else {
                var localFileLoader = new PATHBUBBLES.FileLoader();
                localFileLoader.load(_this.selected_file, function(orthlogData){

                    d3.select('#svg'+ _this.id).remove();
                    var tmp = '';
                    tmp += '<div id= svg'+ _this.id+' style="position: absolute; width:'+ (_this.w + 5)+'px; ' + 'height:'+ (_this.h +5) + 'px; left:' +
                        (_this.x +  _this.w /2 - (Math.min(_this.w,_this.h)-30)/2-10) + ' px; top:' +
                        (_this.y +  _this.h/2 - (Math.min(_this.w,_this.h)-30)/2+50-15) + 'px; "> </div>';
                    $("#bubble").append( $(tmp) );
                    _this.treeRing=null;
                    var val = $menuBarbubble.children('#file').val();
                    var functionType =$menuBarbubble.children('#type').val();
                    _this.treeRing =  new PATHBUBBLES.D3Ring(_this, Math.min(_this.w,_this.h)-30, functionType, val, _this.dataName);
                    _this.treeRing.file = "./data/" + functionType+"/" +val+"/"+_this.dataName+ ".json";
                    _this.treeRing.customOrtholog =  orthlogData;
                    _this.name = _this.pre + "custom";
                    _this.treeRing.init(functionType);
                });
            }
        });
    },
    ungroup: function(){
        if(!this.GROUP)
        {
            alert("It is not Grouped, right now!");
        }
        else
        {
            var group = this.parent;
            this.GROUP = false;
            var tempdata = [];
            for(var i=0; i<group.children.length; ++i)
            {
                if(group.children[i].id!==this.id)
                {
                    var a =group.children[i];
                    a.parent = undefined;
                    tempdata.push(a);
                }
            }
            this.parent = undefined;     //just has one set
            group.tempPoints.length =0;
            group.arranged.length =0;
            group.children.length =0;
            for(var i=tempdata.length-1; i>=0; i--)
            {
                group.RESET = true;
                group.addToGroup(tempdata[i]);
            }
            group.RESET = false;
            scene.addObject(group);
        }
    },
    deleteBubble: function(){
        if($('#svg'+ this.id).length)
            $('#svg'+ this.id).remove();
        if($('#menuView'+ this.id).length)
            $('#menuView'+ this.id).remove();
        this.removeObject(this);
    },
    updateMenu: function () {
        var $menuBarbubble = $('#menuView' + this.id);
        $menuBarbubble.css({
            left: this.x + this.offsetX + this.w + 10,
            top: this.y + this.offsetY + this.cornerRadius / 2 + 40,
            width: 200,
            height: 215
        });
//        $menuBarbubble.find('#type').css({
//            left: 10,
//            top: 25,
//            width: 180
//        });
        $menuBarbubble.find('#crossTalkLevel').css({
            left: 10,
            top: 25,
            width: 180
        });
        $menuBarbubble.find('#ungroup').css({
            left: 10,
            top: 50,
            width: 180
        });
        $menuBarbubble.find('#delete').css({
            left: 10,
            top: 75,
            width: 180
        });
        $menuBarbubble.find('#file').css({
            left: 10,
            top: 95,
            width: 180
        });
        $menuBarbubble.find('#expressionFile').css({
            left: 10,
            top: 95,
            width: 180
        });
        $menuBarbubble.find('#customOrth').css({
            left: 10,
            top: 125,
            width: 180
        });
        $menuBarbubble.find('#loadOrth').css({
            left: 10,
            top: 155,
            width: 180
        });
//        $menuBarbubble.find('#crossTalkLevel').css({
//            left: 10,
//            top: 180,
//            width: 180
//        });
    },
    draw: function (ctx, scale) {
        this.setOffset();
        ctx.save();
        this.shape.draw(ctx, scale);
        var space = 6;
        $('#svg'+ this.id).css({
            width: this.w-10-space,      //leve 6 space for tree ring
            height: this.h-10-space,
            left: this.x +  this.w /2 - this.treeRing.defaultRadius/2-10+space/2,
            top: this.y +  this.h/2 - this.treeRing.defaultRadius/2+50-20+space/2
        });
        //
        this.shape.drawStrokeAgain(ctx,scale);
        ctx.restore();
        if(this.title!==undefined)
        {
            this.title.name = this.name;
            this.title.draw(ctx, scale);
        }

        ctx.save();
        if (this.menu && scale == 1) {
            this.menu.draw(ctx, scale);
        }
        if (this.menu.HighLight_State && scale == 1) {
//            this.menuBar.draw(ctx, scale);
        }
        if (this.menu.HighLight_State) {
            this.updateMenu();
            this.button.show();
        }
        else {
            this.updateMenu();
            this.button.hide();
        }
        ctx.restore();

        if (this.shape.HighLight_State) {
            ctx.save();
            this.shape.drawStroke(ctx, scale);
            ctx.restore();
        }
    },
    setOffset: function () {
        if (this.parent !== undefined) {
            this.offsetX = this.parent.x;
            this.offsetY = this.parent.y;
        }
        else {
            this.offsetX = 0;
            this.offsetY = 0;
        }
        this.shape.offsetX = this.offsetX;
        this.shape.offsetY = this.offsetY;
        this.shape.x = this.x;
        this.shape.y = this.y;
        this.menu.x = this.x + this.w - this.cornerRadius / 2;
        this.menu.y = this.y + this.cornerRadius / 2;
        this.shape.w = this.w;
        this.shape.h = this.h;
    },
    drawSelection: function (ctx, scale) {
        var i, cur, half;
        var x = this.shape.offsetX + this.shape.x;
        var y = this.shape.offsetY + this.shape.y;

        var w = this.shape.w;
        var h = this.shape.h;
        if (this.GROUP) {
            x -= 6;
            y -= 6;
            w += 12;
            h += 12;
        }
        // draw the boxes
        half = PATHBUBBLES.selectionBoxSize / 2;
        // 0  1  2
        // 3     4
        // 5  6  7
        // top left, middle, right
        PATHBUBBLES.selectionHandles[0].x = x - half;
        PATHBUBBLES.selectionHandles[0].y = y - half;

        PATHBUBBLES.selectionHandles[1].x = x + w / 2 - half;
        PATHBUBBLES.selectionHandles[1].y = y - half;

        PATHBUBBLES.selectionHandles[2].x = x + w - half;
        PATHBUBBLES.selectionHandles[2].y = y - half;

        //middle left
        PATHBUBBLES.selectionHandles[3].x = x - half;
        PATHBUBBLES.selectionHandles[3].y = y + h / 2 - half;

        //middle right
        PATHBUBBLES.selectionHandles[4].x = x + w - half;
        PATHBUBBLES.selectionHandles[4].y = y + h / 2 - half;

        //bottom left, middle, right
        PATHBUBBLES.selectionHandles[6].x = x + w / 2 - half;
        PATHBUBBLES.selectionHandles[6].y = y + h - half;

        PATHBUBBLES.selectionHandles[5].x = x - half;
        PATHBUBBLES.selectionHandles[5].y = y + h - half;

        PATHBUBBLES.selectionHandles[7].x = x + w - half;
        PATHBUBBLES.selectionHandles[7].y = y + h - half;

        for (i = 0; i < 8; i += 1) {
            cur = PATHBUBBLES.selectionHandles[i];
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(cur.x * scale, cur.y * scale, PATHBUBBLES.selectionBoxSize * scale, PATHBUBBLES.selectionBoxSize * scale);
        }
    },
    contains: function (mx, my) {
        return this.shape.contains(mx, my);
    },
    insideRect: function (mx, my, x, y, w, h) {
        return  (x <= mx) && (x + w >= mx) && (y <= my) && (y + h >= my);
    },
    containsInMenu: function (mx, my) {
        var x = this.menu.x;
        var y = this.menu.y;
        return  (x - mx ) * (x - mx) + (y - my ) * (y - my) <= this.menu.r * this.menu.r;
    },
    containsInHalo: function (mx, my) {
        var x = this.shape.offsetX + this.shape.x + 5;
        var y = this.shape.offsetY + this.shape.y + 5;
        var w = this.shape.w - 10;
        var h = this.shape.h - 10;

        var x2 = this.shape.offsetX + this.shape.x - 5;
        var y2 = this.shape.offsetY + this.shape.y - 5;
        var w2 = this.shape.w + 10;
        var h2 = this.shape.h + 10;
        return (!this.insideRect(mx, my, x, y, w, h) && this.insideRect(mx, my, x2, y2, w2, h2));
    },
    containsInsideBubble: function (mx, my) {
        var x = this.shape.offsetX + this.shape.x + 5;
        var y = this.shape.offsetY + this.shape.y + 5;
        var w = this.shape.w - 10;
        var h = this.shape.h - 10;
        return this.insideRect(mx, my, x, y, w, h);
    },
    clone: function () {
        var bubble = new PATHBUBBLES.Bubble();
        bubble.id = this.id;
        bubble.name = this.name;
        bubble.parent = this.parent;
        for (var i = 0; i < this.children.length; ++i) {
            var a = this.children[i];
            if (bubble.children.indexOf(a) == -1)
                bubble.children.push(a);
        }
        bubble.type = this.type;
        bubble.x = this.x;
        bubble.y = this.y;
        bubble.w = this.w;
        bubble.h = this.h;
        bubble.strokeColor = this.strokeColor;
        bubble.fillColor = this.fillColor;
        bubble.cornerRadius = this.cornerRadius;

        bubble.shape = new PATHBUBBLES.Shape.Rectangle(this.x, this.y, this.w, this.h, this.strokeColor, this.fillColor, 10, this.cornerRadius);
        bubble.offsetX = this.offsetX;
        bubble.offsetY = this.offsetY;

        bubble.center = this.center;
        bubble.GROUP = this.GROUP;
        return bubble;
    }
};
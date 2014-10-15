/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/17/2014
 * @name        PathBubble_groups
 */
PATHBUBBLES.Groups = function () {
    PATHBUBBLES.Object2D.call(this);
    this.shape = new PATHBUBBLES.Shape.Path("#0000ff", "#ffffff", 10);
    this.type = "Group";
    this.arranged = [];
    this.tempPoints = [];
};
PATHBUBBLES.Groups.prototype = Object.create(PATHBUBBLES.Object2D.prototype);
PATHBUBBLES.Groups.prototype = {

    constructor: PATHBUBBLES.Groups,
    removeObject: function (object) {
        var index = this.children.indexOf(object);
        this.children.splice(index, 1);

    },
    resetShapes: function (object) {
        this.arranged.length = 0;
        this.tempPoints.length = 0;
        this.shape.points.length = 0;
        var index = this.children.indexOf(object);
        if (index == -1)
            this.children.push(object);
        for (var i = 0; i < this.children.length; ++i) {
            this.RESET = true;
            this.objectAddToGroup(this.children[i]);
        }
        this.RESET = false;
    },
    addToGroup: function (object) {
        if (object.parent instanceof PATHBUBBLES.Groups) {
            var temp = object.parent;
            var childrenObjs = [];
            for (var i = 0; i < object.parent.children.length; ++i) {
                var a = object.parent.children[i];
                a.offsetX = 0;
                a.offsetY = 0;
                childrenObjs.push(a);
            }
            scene.removeObject(temp);
            for (var i = 0; i < childrenObjs.length; ++i) {
                this.objectAddToGroup(childrenObjs[i]);
            }
        }
        else {
            this.objectAddToGroup(object);
        }

    },
    objectAddToGroup: function (object) {
        if (object) {
            object.GROUP = true;
            object.parent = this;
            if (this.children.indexOf(object) == -1 || this.RESET) {
                scene.addObject(object);
                if (this.children.indexOf(object) == -1)
                    this.children.push(object);
                if (this.arranged.length == 0) {
                    this.tempPoints.length = 0;
                    var left = {};
                    left.x = object.x;
                    left.y = object.y;
                    left.type = "QCT";
                    left.id = object.id;
                    left.pos = "left";
                    this.tempPoints.push(left);

                    var right = {};
                    right.x = object.x + object.w;
                    right.y = object.y;
                    right.type = "QCT";
                    right.id = object.id;
                    right.pos = "right";
                    this.tempPoints.push(right);

                    var bright = {};
                    bright.x = object.x + object.w;
                    bright.y = object.y + object.h;
                    bright.id = object.id;
                    bright.pos = "bright";
                    bright.type = "QCT";
                    this.tempPoints.push(bright);

                    var bleft = {};
                    bleft.x = object.x;
                    bleft.y = object.y + object.h;
                    bleft.type = "QCT";
                    bleft.id = object.id;
                    bleft.pos = "bleft";
                    this.tempPoints.push(bleft);
                    this.arranged.push(object);
                }
                if (this.tempPoints.length !== 0 || !this.RESET) {
                    for (var i = 0; i < this.tempPoints.length; ++i) {
                        this.tempPoints[i].x += this.offsetX;
                        this.tempPoints[i].offsetX = this.offsetX;
                        this.tempPoints[i].y += this.offsetY;
                        this.tempPoints[i].offsetY = this.offsetY;
                    }
                }
                var tempCompare = [];
                for (var j = 0; j < this.arranged.length; ++j) {
                    if (this.arranged[j] !== object) {
                        var objs = this.calculateUpDownLeftRight(this.arranged[j], object);
                        for (var ji = 0; ji < objs.length; ++ji) {
                            if (tempCompare.indexOf(objs[ji]) == -1)
                                objs[ji].object = this.arranged[j];
                            tempCompare.push(objs[ji]);
                        }
                    }
                }

                var moveDistance = Infinity;
                var at = null;
                for (var ii = 0; ii < tempCompare.length; ++ii) {
                    if (tempCompare[ii].flag !== false && tempCompare[ii].moveDistance < moveDistance) {
                        moveDistance = tempCompare[ii].moveDistance;
                        at = tempCompare[ii];
                    }
                }
                if (at) {
                    object.shape.x = at.x;
                    object.shape.y = at.y;
                    object.x = at.x;
                    object.y = at.y;
                    object.w = at.w;
                    object.h = at.h;
                    if (this.arranged.indexOf(object) == -1)
                        this.arranged.push(object);

                    switch (at.type) {

                        case "left":   //find left-up corner coordinate position
                            var begin = -1;
                            var end = -1;
                            for (var k = 0; k < this.tempPoints.length; ++k) {
                                if (Math.floor(at.object.x) == Math.floor(this.tempPoints[k].x) &&  //left-down
                                    Math.floor(at.object.y + at.object.h) == Math.floor(this.tempPoints[k].y)) {
                                    end = k;
                                }
                                if (begin !== -1 && end !== -1) {
                                    break;
                                }
                            }
                            //put points before begin and after end
                            var bright = {};
                            bright.x = object.x + object.w;
                            bright.y = object.y + object.h;
                            bright.type = "QCT";
                            bright.id = object.id;
                            bright.pos = "bright";
                            this.tempPoints.splice(end + 1, 0, bright);
                            var bleft = {};
                            bleft.x = object.x;
                            bleft.y = object.y + object.h;
                            bleft.type = "QCT";
                            bleft.id = object.id;
                            bleft.pos = "bleft";
                            this.tempPoints.splice(end + 2, 0, bleft);
                            var left = {};
                            left.x = object.x;
                            left.y = object.y;
                            left.type = "QCT";
                            left.id = object.id;
                            left.pos = "left";
                            this.tempPoints.splice(end + 3, 0, left);
                            var right = {};
                            right.x = object.x + object.w;
                            right.y = object.y;
                            right.type = "QCT";
                            right.id = object.id;
                            right.pos = "right";
                            this.tempPoints.splice(end + 4, 0, right);

                            break;
                        case "right":
                            var begin = -1;
                            for (var k = 0; k < this.tempPoints.length; ++k) {
                                if (Math.floor(at.object.x + at.object.w) == Math.floor(this.tempPoints[k].x) &&
                                    Math.floor(at.object.y) == Math.floor(this.tempPoints[k].y))  //left-up
                                {
                                    begin = k;
                                    break;
                                }

                            }
                            //put points after begin and before end
                            var left = {};
                            left.x = object.x;
                            left.y = object.y;
                            left.type = "QCT";
                            left.id = object.id;
                            left.pos = "left";
                            this.tempPoints.splice(begin + 1, 0, left);

                            var right = {};
                            right.x = object.x + object.w;
                            right.y = object.y;
                            right.type = "QCT";
                            right.id = object.id;
                            right.pos = "right";
                            this.tempPoints.splice(begin + 2, 0, right);

                            var bright = {};
                            bright.x = object.x + object.w;
                            bright.y = object.y + object.h;
                            bright.type = "QCT";
                            bright.id = object.id;
                            bright.pos = "bright";
                            this.tempPoints.splice(begin + 3, 0, bright);

                            var bleft = {};
                            bleft.x = object.x;
                            bleft.y = object.y + object.h;
                            bleft.type = "QCT";
                            bleft.id = object.id;
                            bleft.pos = "bleft";
                            this.tempPoints.splice(begin + 4, 0, bleft);
                            break;
                        case "up":
                            var begin = -1;
                            for (var k = 0; k < this.tempPoints.length; ++k) {
                                if (Math.floor(at.object.x) == Math.floor(this.tempPoints[k].x) &&
                                    Math.floor(at.object.y) == Math.floor(this.tempPoints[k].y))  //left-up
                                {
                                    begin = k;
                                    break;
                                }

                            }
                            //put points after begin and before end
                            var bleft = {};
                            bleft.x = object.x;
                            bleft.y = object.y + object.h;
                            bleft.type = "QCT";
                            bleft.pos = "bleft";
                            bleft.id = object.id;
                            this.tempPoints.splice(begin + 1, 0, bleft);

                            var left = {};
                            left.x = object.x;
                            left.y = object.y;
                            left.type = "QCT";
                            left.id = object.id;
                            left.pos = "left";
                            this.tempPoints.splice(begin + 2, 0, left);
                            var right = {};
                            right.x = object.x + object.w;
                            right.y = object.y;
                            right.type = "QCT";
                            right.id = object.id;
                            right.pos = "right";
                            this.tempPoints.splice(begin + 3, 0, right);

                            var bright = {};
                            bright.x = object.x + object.w;
                            bright.y = object.y + object.h;
                            bright.type = "QCT";
                            bright.id = object.id;
                            bright.pos = "bright";
                            this.tempPoints.splice(begin + 4, 0, bright);


                            break;
                        case "down":
                            var begin = -1;
                            for (var k = 0; k < this.tempPoints.length; ++k) {
                                if (Math.floor(at.object.x + at.object.w) == Math.floor(this.tempPoints[k].x) &&
                                    Math.floor(at.object.y + at.object.h) == Math.floor(this.tempPoints[k].y)) //left-up
                                {
                                    begin = k;
                                    break;
                                }

                            }
                            //put points after begin and before end
                            var right = {};
                            right.x = object.x + object.w;
                            right.y = object.y;
                            right.type = "QCT";
                            right.id = object.id;
                            right.pos = "right";
                            this.tempPoints.splice(begin + 1, 0, right);

                            var bright = {};
                            bright.x = object.x + object.w;
                            bright.y = object.y + object.h;
                            bright.type = "QCT";
                            bright.id = object.id;
                            bright.pos = "bright";
                            this.tempPoints.splice(begin + 2, 0, bright);

                            var bleft = {};
                            bleft.x = object.x;
                            bleft.y = object.y + object.h;
                            bleft.type = "QCT";
                            bleft.id = object.id;
                            bleft.pos = "bleft";
                            this.tempPoints.splice(begin + 3, 0, bleft);

                            var left = {};
                            left.x = object.x;
                            left.y = object.y;
                            left.type = "QCT";
                            left.id = object.id;
                            bleft.pos = "left";
                            this.tempPoints.splice(begin + 4, 0, left);
                            break;
                    }
                    if (this.tempPoints.length !== 0) {
//                        for (var iii = 0; iii < this.tempPoints.length; ++iii)
//                            for (var j = iii + 1; j < this.tempPoints.length - 1; ++j) {
//                                if (this.tempPoints[iii] == this.tempPoints[j]) {
//                                    this.tempPoints[iii] = null;
//                                    this.tempPoints[j] = null;
//                                }
//                            }
                        this.processPolygon();
                    }
                }
            }
            return this;
        }
    },
    processPolygon: function () {
        this.shape.points.length = 0;
        for (var i = 0; i < this.tempPoints.length; ++i) {
            if (this.tempPoints[i]) {
                if (this.tempPoints[i] || !this.RESET)       //Here we need to know when draw the shape, we also add the offset again.
                {
                    this.tempPoints[i].x -= this.offsetX;
                    this.tempPoints[i].y -= this.offsetY;
                }

                for (var ii = 0; ii < PATHBUBBLES.objects.length; ++ii) {
                    if ( (PATHBUBBLES.objects[ii] instanceof  PATHBUBBLES.Bubble || PATHBUBBLES.objects[ii] instanceof  PATHBUBBLES.TreeRing) && PATHBUBBLES.objects[ii].id == this.tempPoints[i].id && this.tempPoints.pos == "left") {
                        PATHBUBBLES.objects[ii].x = this.tempPoints[i].x;
                        PATHBUBBLES.objects[ii].y = this.tempPoints[i].y;
                        break;
                    }
                }
            }
        }
        return this;
    },
    calculateUpDownLeftRight: function (object, target) {
        var objects = [];
        var left = {};
        var right = {};
        var up = {};
        var down = {};
        left.x = object.x - target.w;
        left.y = target.y;
        left.w = target.w;
        left.h = target.h;
        left.flag = true;
        left.moveDistance = Math.abs(target.x - left.x);
        for (var i = 0; i < this.arranged.length; ++i) {
            if (this.detectOverlap(this.arranged[i], left)) {
                left.flag = false;
            }
        }
        left.type = "left";
        objects.push(left);

        right.x = object.x + object.w;
        right.y = target.y;
        right.w = target.w;
        right.h = target.h;
        right.flag = true;
        right.moveDistance = Math.abs(right.x - target.x);
        for (var i = 0; i < this.arranged.length; ++i) {
            if (this.detectOverlap(this.arranged[i], right)) {
                right.flag = false;
            }
        }
        right.type = "right";
        objects.push(right);

        up.x = target.x;
        up.y = object.y - target.h;
        up.w = target.w;
        up.h = target.h;
        up.flag = true;
        up.moveDistance = Math.abs(target.y - up.y);
        for (var i = 0; i < this.arranged.length; ++i) {
            if (this.detectOverlap(this.arranged[i], up)) {
                up.flag = false;
            }
        }
        up.type = "up";
        objects.push(up);

        down.x = target.x;
        down.y = object.y + object.h;
        down.w = target.w;
        down.h = target.h;
        down.flag = true;
        down.moveDistance = Math.abs(down.y - target.y);
        for (var i = 0; i < this.arranged.length; ++i) {
            if (this.detectOverlap(this.arranged[i], down)) {
                down.flag = false;
            }
        }
        down.type = "down";
        objects.push(down);
        return objects;
    },
    detectOverlap: function (object1, object2) {
        return (object1.x < object2.x + object2.w &&
            object1.x + object1.w > object2.x &&
            object1.y < object2.y + object2.h &&
            object1.h + object1.y > object2.y) ||
            (object2.x < object1.x + object1.w &&
                object2.x + object2.w > object1.x &&
                object2.y < object1.y + object1.h &&
                object2.h + object2.y > object1.y);
    },
    setOffset: function () {
        this.shape.offsetX = this.offsetX;
        this.shape.offsetY = this.offsetY;
    },
    draw: function (ctx, scale) {

        if (this.shape.points.length) {
            this.setOffset();
            //ctx.save();
//            this.shape.draw(ctx, scale);
//
            for (var i = 0; i < this.children.length; ++i) {
                this.children[i].draw(ctx, scale);
            }
            //ctx.restore();
        }
    }
};

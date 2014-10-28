/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/16/2014
 * @name        PathBubble_render
 */
PATHBUBBLES.Renderer = function () {
    this.canvasWidth = canvas.clientWidth;
    this.canvasHeight = canvas.clientHeight;
    this.navCanvasWidth = navCanvas.clientWidth;
    this.navCanvasHeight = navCanvas.clientHeight;
    this.alpha = false;
    this.ctx = canvas.getContext('2d', {
//        alpha: this.alpha === true
    });  // when set to false, the canvas will redraw everything
    this.nav_ctx = navCanvas.getContext('2d', {
//        alpha: this.alpha === true
    });  // when set to false, the canvas will redraw everything
    this.valid = false;
};
PATHBUBBLES.Renderer.prototype = {
    constructor: PATHBUBBLES.Renderer,

    clear: function () {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.nav_ctx.fillStyle = "#666699";
        this.nav_ctx.fillRect(0, 0, 300, 150);
        this.nav_ctx.clearRect(0, 0, this.navCanvasWidth, this.navCanvasHeight);

    },
    render: function () {
        var _this = this;

        function drawObject(object) {
            if (!(object instanceof PATHBUBBLES.Scene) && !( object instanceof PATHBUBBLES.Object2D )) {
                object.draw(_this.ctx);
            }
            if (!(object instanceof PATHBUBBLES.Groups)) {
                for (var i = 0, l = object.children.length; i < l; i++) {
                    drawObject(object.children[ i ]);
                }
            }
        }

        if (!_this.valid) {
            _this.clear();
            viewpoint.draw(_this.nav_ctx, 1);
            if (scene.children.length > 0) {
                for (var i = scene.children.length-1; i >=0 ; i--) {
                    if (scene.children[i] instanceof PATHBUBBLES.Bubble || scene.children[i] instanceof PATHBUBBLES.Groups
                        ||scene.children[i] instanceof PATHBUBBLES.TreeRing || scene.children[i] instanceof PATHBUBBLES.Table) {
                        scene.children[i].draw(_this.ctx, 1);
                        scene.children[i].draw(_this.nav_ctx, this.navCanvasHeight / this.canvasHeight);
                    }
                }
            }
        }
    }
};

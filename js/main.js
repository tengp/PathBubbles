/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/16/2014
 * @name        main
 */
var scene;
var canvas;
var navCanvas;
var viewpoint=null;
var navInterection;
var interection;
$(document).ready(function (){
    scene = new PATHBUBBLES.Scene();
    viewpoint = new PATHBUBBLES.ViewPoint();
    canvas = $("#bgCanvas")[0];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    navCanvas = $("#navCanvas")[0];
    navCanvas.height =50;
    navCanvas.width = window.innerWidth;
    var renderer = new PATHBUBBLES.Renderer();
    navInterection = new PATHBUBBLES.NavInteraction(renderer);
    interection = new PATHBUBBLES.Interaction(renderer);

    function render() {
        var reqAnimFrame = window.mozRequestAnimationFrame    ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame     ||
            window.oRequestAnimationFrame
        ;

        reqAnimFrame(render);
        //requestAnimationFrame(render);
        renderer.render();
    }
    render();

    var mousePosX, mousePosY;

    $('#bgCanvas').on('contextmenu', function (e) {
        mousePosX = e.clientX;
        mousePosY = e.clientY;
    });
    $('#bubble').contextMenu({
        selector: '#bgCanvas',
        callback: function (key) {
            if (key === 'Open_Bubble') {
                var bubble4 = new PATHBUBBLES.Bubble(mousePosX, mousePosY);
                bubble4.menuOperation();
                if(viewpoint)
                {
                    bubble4.offsetX = viewpoint.x;
                    bubble4.offsetY = viewpoint.y;
                }
                scene.addObject(bubble4);
            }
            else if(key === 'Delete_All')
            {
                PATHBUBBLES.objects.length =0;
                for(var i= 0, l=scene.children.length;i<l; ++i)
                {
                    if(scene.children[i])
                        scene.removeObject(scene.children[i]);
                }
                scene.children.length =0;
            }
        },
        items: {
            "Open_Bubble": {name: "Open_bubble", enabled: false},
//            "Open_VC_Menu": {name: "Open_vc_menu", enabled: false},
//            "Compare": {name: "Compare", enabled: false},
            "sep1": "---------",
            "Delete_All": {name: "Delete_all", enabled: false}
        }
    });
});

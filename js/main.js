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
        requestAnimationFrame(render);
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
            else if (key === 'Open_TreeRing') {
                var bubble5 = new PATHBUBBLES.TreeRing(mousePosX, mousePosY,700,760, "homo sapiens");
                bubble5.addHtml();
                bubble5.menuOperation();
                if(viewpoint)
                {
                    bubble5.offsetX = viewpoint.x;
                    bubble5.offsetY = viewpoint.y;
                }
                scene.addObject(bubble5);
            }
            else if (key === 'Open_Table') {
                var bubble6 = new PATHBUBBLES.Table(mousePosX, mousePosY,500,500,1643713);
                bubble6.addHtml();
                bubble6.menuOperation();
                if(viewpoint)
                {
                    bubble6.offsetX = viewpoint.x;
                    bubble6.offsetY = viewpoint.y;
                }
                scene.addObject(bubble6);
            }
            else if(key === 'Delete_All')
            {
                for(var i= 0, l=scene.children.length;i<l; ++i)
                {
                    if(scene.children[i])
                        scene.removeObject(scene.children[i]);
                }
                scene.children.length =0;
                for(var i= 0, l=PATHBUBBLES.objects.length; i <l; i++)
                {
                    if(PATHBUBBLES.objects[i])
                        delete PATHBUBBLES.objects[i];
                }
                PATHBUBBLES.objects.length =0;

                $('svg').parent().remove();
                $('.menu').remove();
            }
        },
        items: {
            "Open_Bubble": {name: "Open_bubble"},
            "Open_TreeRing": {name: "Open_treeRing"},
            "Open_Table": {name: "Open_table"},
            "sep1": "---------",
            "Delete_All": {name: "Delete_all"}
        }
    });
});
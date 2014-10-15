/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/27/2014
 * @name        PathBubble_Button
 */
PATHBUBBLES.Button = function (menuBar)
{
    this.menuBar = menuBar;
    this.x = 20;
    this.w = 80;
    this.y = 20;
    this.h = 20;
};
PATHBUBBLES.Button.prototype = {
    constructor: PATHBUBBLES.Button,
    addButton: function (tmpHtml) {
//        this.menuBar.buttons.push(this);
       this.menuBar.button = this;
        var $menuBarId = $('#'+ this.menuBar.bubble.id );
        if ($menuBarId.length > 0 ) {
            $menuBarId.append( $(tmpHtml) );
        }
        else
        {
            var tmp = '';
            tmp += '<div id ="menuView' + this.menuBar.bubble.id + '" style="position: absolute; left:' + this.menuBar.x + ' px; top: ' + (this.menuBar.y + 20) + ' px; width: ' + this.menuBar.w +' px; height: ' + (this.menuBar.h - 20) +' px; display: none; ">';
            tmp += tmpHtml;
            tmp += '</div>';
            $("#bubble").append( $(tmp) );
        }
    },
    remove: function(){
        $('#menuView'+ this.menuBar.bubble.id).remove();
    },
    show:function(){
        $('#menuView'+ this.menuBar.bubble.id).show();
    },
    hide:function(){
        $('#menuView'+ this.menuBar.bubble.id).hide();
    }
};
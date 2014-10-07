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
    addButton: function () {
//        this.menuBar.buttons.push(this);
       this.menuBar.button = this;
        var $menuBarId = $('#'+ this.menuBar.bubble.id );
        if ($menuBarId.length > 0 ) {
            var tmp = '';
            tmp += '<input type="file" id=file style="position: absolute; left:' + this.x + ' px; top:' + this.y + 'px; ">';
            tmp += '<input type="button" id=load value= "Load" style="position: absolute; left:' + this.x + ' px; top:' + this.y+25 + 'px; ">';
            tmp += '<div id=colorpickerField style="position: absolute; left:' + this.x + ' px; top: ' + this.y+55 + ' px; "></div>';
            tmp += '<input type="button" id=ungroup value= "Ungroup" style="position: absolute; left:' + this.x + ' px; top:' + this.y+80 + 'px; ">';
            tmp += '<input type="button" id=delete value= "Delete" style="position: absolute; left:' + this.x + ' px; top:' + this.y+105 + 'px; ">';
            $menuBarId.append( $(tmp) );
        }
        else
        {
            var tmp = '';
            tmp += '<div id ="menuView' + this.menuBar.bubble.id + '" style="position: absolute; left:' + this.menuBar.x + ' px; top: ' + (this.menuBar.y + 20) + ' px; width: ' + this.menuBar.w +' px; height: ' + (this.menuBar.h - 20) +' px; display: none; ">';
            tmp += '<input type="file" id=file style="position: absolute; left:' + this.x + ' px; top: ' + this.y + ' px;">';
            tmp += '<input type="button" id=load value= "Load" style="position: absolute; left:' + this.x + ' px; top: ' + this.y+25 + ' px; ">';
            tmp += '<div id=colorpickerField style="position: absolute; left:' + this.x + ' px; top: ' + this.y+55 + ' px; "></div>';
            tmp += '<input type="button" id=ungroup value= "Ungroup" style="position: absolute; left:' + this.x + ' px; top:' + this.y+80 + 'px; ">';
            tmp += '<input type="button" id=delete value= "Delete" style="position: absolute; left:' + this.x + ' px; top:' + this.y+105 + 'px; ">';
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
    },
    update: function(){
        var $menuBarbubble = $('#menuView'+ this.menuBar.bubble.id);
        $menuBarbubble.find('#file').css({
           left:this.menuBar.x+10 ,
           top: this.menuBar.y+90,
           width: 180
        });
        $menuBarbubble.find('#load').css({
            left:this.menuBar.x+10 ,
            top: this.menuBar.y+115,
            width: 180
        });
        $menuBarbubble.find('#colorpickerField').css({
            left:this.menuBar.x+10 ,
            top: this.menuBar.y+145,
            width: 180
        });
        $menuBarbubble.find('#ungroup').css({
            left:this.menuBar.x+10 ,
            top: this.menuBar.y+170,
            width: 180
        });
        $menuBarbubble.find('#delete').css({
            left:this.menuBar.x+10 ,
            top: this.menuBar.y+195,
            width: 180
        });
    }
};
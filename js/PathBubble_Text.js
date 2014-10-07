/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/17/2014
 * @name        PathBubbles_text
 */
PATHBUBBLES.Text = function(object, text)
{
    this.object = object;
    this.x = 0;
    this.y = 0;
    this.fillColor = '#0000ff';
    this.text = text;
    this.font = '20pt Calibri';
    this.textAlign = 'center';   //
    this.textBaseline= 'middle';   //bottom
};
PATHBUBBLES.Text.prototype ={
    constructor: PATHBUBBLES.Text,

    draw : function(ctx,x,y)
    {
//        ctx.save();	// save the context so we don't mess up others
        ctx.font = this.font;
        // textAlign aligns text horizontally relative to placement
        ctx.textAlign = this.textAlign;
        // textBaseline aligns text vertically relative to font style
        ctx.textBaseline = this.textBaseline;
        ctx.fillStyle = this.fillColor;
        ctx.fillText(this.text, x, y);
//        ctx.restore();	// restore context to what it was on entry
    },
    getTextHeight : function() {
        return 15;
    },
    getTextWidth : function(ctx) {
//        ctx.save();
        ctx.font = this.font;
//        var width = ctx.measureText(this.text).width;
//        ctx.restore();
        return ctx.measureText(this.text).width;
    }
};

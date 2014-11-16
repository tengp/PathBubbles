/**
 * @author      Yongnan
 * @version     1.0
 * @time        11/16/2014
 * @name        info
 */
$(function() {
    $("#infoBox")
        .css(
        {
            "background-color":"rgba(255,255,255,1)"
        })
        .dialog({ autoOpen: false,
            resizable: false,
            show: { effect: 'fade', duration: 500 },
            hide: { effect: 'fade', duration: 500 }
        });
    $("#infoBox").dialog("open");
});
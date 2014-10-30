/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/28/2014
 * @name        PathBubble_Loader
 */
PATHBUBBLES.FileLoader = function(){
};
PATHBUBBLES.FileLoader.prototype = {
    constructor: PATHBUBBLES.FileLoader,
    load: function (url,callback) {
        var _this = this;
        if (typeof url === 'undefined') {
            alert("Please Choose the data which needs to load!");
            return;
        }
        var reader = new FileReader();
//        this.statusDomElement = this.addStatusElement();
//        $("#bubble")[0].appendChild(this.statusDomElement);
        reader.readAsText(url, "UTF-8");
//        var fileName = url.name;
//        if (fileName.lastIndexOf('.') !== -1)
//            fileName = fileName.substr(0, fileName.lastIndexOf('.'));
//        this.fileName = fileName;
        reader.onerror = function () {
//            _this.statusDomElement.innerHTML = "Could not read file, error code is " + reader.error.code;
        };
        reader.onprogress = function (event) {
//            _this.updateProgress(event);
        };

        reader.onload = function () {
            var result = [];
            var tempdata = "";
            tempdata = reader.result;
            if (tempdata != null) {
                var orthology= tempdata.split("\r\n");

                for(var j=0; j<orthology.length; ++j) {
                    if(orthology[j]=="")
                    {
                        continue;
                    }
                    var obj ={};
                    var temps = orthology[j].split("\t");
                    obj.simbol = temps[0];
                    obj.dbId = temps[1];
                    result.push(obj);
                }
                callback(result);
            }
        };

    }
};

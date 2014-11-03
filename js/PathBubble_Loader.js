/**
 * @author      Yongnan
 * @version     1.0
 * @time        10/28/2014
 * @name        PathBubble_Loader
 */
PATHBUBBLES.FileLoader = function(type){      //"Ortholog" "Expression"
    this.type = type;
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
                if(_this.type == "Ortholog")
                {
                    var orthology= tempdata.split("\r\n");

                    for(var j=0; j<orthology.length; ++j) {
                        if(orthology[j]=="")
                        {
                            continue;
                        }
                        var obj ={};
                        var temps = orthology[j].split("\t");
                        obj.symbol = temps[0];
                        obj.dbId = temps[1];
                        result.push(obj);
                    }
                    callback(result);
                }
                else if(_this.type == "Expression")
                {
                    var expression= tempdata.split("\r\n");

                    for(var j=0; j<expression.length; ++j) {
                        if(expression[j]=="")
                        {
                            continue;
                        }
                        var temps = expression[j].split("\t");
                        if(temps[0]=="gene_id"|| temps[2] =="Infinity" || temps[2] =="NaN" )
                        {
                            continue;
                        }
                        var obj ={};
                        obj.gene_id = temps[0];
                        obj.symbol = temps[1];
                        obj.ratio = temps[2];
                        result.push(obj);
                    }
                    callback(result);
                }


            }
        };

    }
};

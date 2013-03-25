var cleanCSS = require('clean-css');
var UglifyJS = require("uglify-js");
var glob = require('glob');
var fs = require('fs');
var natcompare = require('./natcompare.js');

var packages = Array();

glob("../ajax/libs/**/package.json", function (error, matches) {
    matches.forEach(function(element){
        var package = JSON.parse(fs.readFileSync(element, 'utf8'));
        package.assets = Array();
        var versions = glob.sync("../ajax/libs/"+package.name+"/!(package.json)");
        versions.forEach(function(version) {
            var temp = Object();
            temp.version = version.replace(/^.+\//, "");
            temp.files = glob.sync(version + "/**/*.*");

            for (var i = 0; i < temp.files.length; i++){
                var regex = /(?:^.+\/)?(.+?)([\.-](?:min))?\.((?:js)|(?:css))$/ig;
                var result = regex.exec(temp.files[i]);
                //result[0] Original Input
                //result[1] Filename
                //result[2] -/.min
                //result[3] file extension

                if (result == null) {
                    continue;
                }

                if (typeof result[2] !== "undefined") {
                    continue;
                }

                var min_exists = false;
                for (var j = 0; j < temp.files.length; j++) {
                    var regex = /(?:^.+\/)?(.+?)([\.-](?:min))?\.((?:js)|(?:css))$/ig;
                    var exists = regex.exec(temp.files[j]);
                    if (exists == null || exists[0] == result[0]) { //Matching Same File
                        continue;
                    }
                    //Same name, same extension
                    if (exists[1] == result[1] && exists[3] == result[3] && typeof exists[2] !== "undefined") {
                        min_exists = true;
                        break;
                    }
                }

                if (!min_exists) {
                    var original_path = result[0].substring(0, result[0].lastIndexOf(result[1]));

                    if (result[3] == "js") {
                        var source = fs.readFileSync(temp.files[i], 'utf8');
                        var minimized = UglifyJS.minify(source, {fromString: true});
                        fs.writeFileSync(original_path + result[1] + ".min.js", minimized, 'utf8');
                        console.log("minimized file: " + original_path + result[1] + ".min.js");
                    } else if (result[3] == "css") {
                        var source = fs.readFileSync(temp.files[i], 'utf8');
                        var minimized = cleanCSS.process(source);
                        fs.writeFileSync(original_path + result[1] + ".min.css", minimized, 'utf8');
                        console.log("minimized file: " + original_path + result[1] + ".min.css");
                    }
                }
            }
        });
    });
});

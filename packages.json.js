var glob = require('glob');
var fs = require('fs');


var packages = Array();

glob("../cdnjs/ajax/libs/**/package.json", function (error, matches) {
  matches.forEach(function(element){
    var package = JSON.parse(fs.readFileSync(element, 'utf8'));
    package.assets = Array();
    var versions = glob.sync("../cdnjs/ajax/libs/"+package.name+"/!(package.json)");
    versions.forEach(function(version) {
      var temp = Object();
      temp.version = version.replace(/^.+\//, "");
      temp.files = glob.sync(version + "/**/*.*");
      for (var i = 0; i < temp.files.length; i++){
        temp.files[i] = temp.files[i].replace(version + "/", "");
      }
      package.assets.push(temp);
    });
    packages.push(package);
  });

  fs.writeFileSync('../cdnjs-website/packages.json', JSON.stringify({"packages":packages}, null, 4), 'utf8');
});

var glob = require('glob');
var fs = require('fs');
var natcompare = require('./natcompare.js');


var packages = Array();

glob("ajax/libs/**/package.json", function (error, matches) {
  matches.forEach(function(element){
    var package = JSON.parse(fs.readFileSync(element, 'utf8'));
    package.assets = Array();
    var versions = glob.sync("ajax/libs/"+package.name+"/!(package.json)");
    versions.forEach(function(version) {
      var temp = Object();
      temp.version = version.replace(/^.+\//, "");
      temp.files = glob.sync(version + "/**/*.*");
      for (var i = 0; i < temp.files.length; i++){
        temp.files[i] = temp.files[i].replace(version + "/", "");
      }
      package.assets.push(temp);
    });
    package.assets.sort(function(a, b){
      return natcompare.compare(a.version, b.version);
    })
    package.assets.reverse();
    packages.push(package);
  });

  fs.writeFileSync('packages.json', JSON.stringify({"packages":packages}, null, 4), 'utf8');
});

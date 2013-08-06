var glob = require("glob")
  , natcompare = require("./natcompare")
  , fs = require('fs')

if (!process.argv[2] || !process.argv[3]) {
  console.log('[Usage] node build/build.js <source> <dest>');
  process.exit();
}

var dir = process.argv[2];
var dest = process.argv[2];

listPackages(dir, function (err, results) {
  var packages = [];
  Object.keys(results).forEach(function (key) {
    packages = packages.concat(results[key]);
  });
  fs.writeFileSync(dest + '/packages.json', JSON.stringify({"packages": packages}, null, ''), 'utf8');
  console.log("Build ok!");
});

function listPackages(dir, callback) {
  var packages = Array();

  console.log(dir + "/**/package.json");

  glob(dir + "/**/package.json", function (error, matches) {
    matches.forEach(function (element) {
      var package = JSON.parse(fs.readFileSync(element, 'utf8'));
      package.assets = Array();
      var versions = glob.sync(dir + "/" + package.name + "/!(package.json)");
      versions.forEach(function (version) {
        var temp = Object();
        temp.version = version.replace(/^.+\//, "");
        temp.files = glob.sync(version + "/**/*.*");
        for (var i = 0; i < temp.files.length; i++) {
          temp.files[i] = temp.files[i].replace(version + "/", "");
        }
        package.assets.push(temp);
      });
      package.assets.sort(function (a, b) {
        return natcompare.compare(a.version, b.version);
      })
      package.assets.reverse();
      packages.push(package);
    });

    callback(null, packages);
  });
};

var glob = require('glob');
var fs = require('fs');
var _ = require('underscore');
var natcompare = require('./natcompare.js');
var RSS = require('rss');
var feed = new RSS({
    title:        'My Feed Title',
    description:  'This is my personnal feed!',
    link:         'http://example.com/',
    image:        'http://example.com/logo.png',
    copyright:    'Copyright © 2013 John Doe. All rights reserved',
 
    author: {
        name:     'John Doe',
        email:    'john.doe@example.com',
        link:     'https://example.com/john-doe'
    }
});
var exec=require('child_process').exec;
exec('git ls-tree -r --name-only HEAD | grep **/package.json | while read filename; do   echo "$(git log -1 --since="2 weeks ago" --name-status --format="%ad" -- $filename) blahcrap"; done',function(err,stdout,stderr){
    var recentLibraries = stdout.split('blahcrap');
    recentLibraries = _.filter(recentLibraries, function(lib){
      if(lib.length > 4) {
        return true;
      };
      return false;
    })
    recentLibraries = _.map(recentLibraries, function(lib){
      lib = lib.replace('\n\n', '\n');
      lib = lib.replace('\t', '\n');
      lib = lib.substr(1);
      lib = lib.split('\n');
      lib[0] = new Date(lib[0]);
      lib = {
        date: lib[0],
        change: lib[1],
        path: lib[2].replace(/(^\s+|\s+$)/g, '')
      }
      return lib;
    })
    recentLibraries = _.sortBy(recentLibraries, function(arrayElement) {
    //element will be each array, so we just return a date from first element in it
    return arrayElement.date.getTime();
    });
    recentLibraries = recentLibraries.reverse();
    _.each(recentLibraries, function (lib) {
      var package = JSON.parse(fs.readFileSync(lib.path, 'utf8'));
      var title = '';
      if(lib.change === 'M') {
        title = package.name + ' was modified'
      }
      if(lib.change === 'A') {
        title = package.name + ' was added'
      }
      feed.item({
          title:          title,
          link:           package.homepage,
          description:    package.description,
          date:           lib.date
      });
    })
    fs.writeFileSync('rss', feed.xml(), 'utf8');

    console.log(recentLibraries);
})

return;
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
  // Initialize the feed object
  fs.writeFileSync('packages.json', JSON.stringify({"packages":packages}, null, 4), 'utf8');
});

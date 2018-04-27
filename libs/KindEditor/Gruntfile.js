module.exports = function (grunt) {
  grunt.initConfig({
    uglify: { //js minified
      build: {
        files: {
          '4.1.10/lang/ar.min.js': '4.1.10/lang/ar.js',
          '4.1.10/lang/en.min.js': '4.1.10/lang/en.js',
          '4.1.10/lang/ko.min.js': '4.1.10/lang/ko.js',
          '4.1.10/lang/zh_CN.min.js': '4.1.10/lang/zh_CN.js',
          '4.1.10/lang/zh_TW.min.js': '4.1.10/lang/zh_TW.js',
          '4.1.10/plugins/anchor/anchor.min.js': '4.1.10/plugins/anchor/anchor.js',
          '4.1.10/plugins/autoheight/autoheight.min.js': '4.1.10/plugins/autoheight/autoheight.js',
          '4.1.10/plugins/baidumap/baidumap.min.js': '4.1.10/plugins/baidumap/baidumap.js',
          '4.1.10/plugins/clearhtml/clearhtml.min.js': '4.1.10/plugins/clearhtml/clearhtml.js',
          '4.1.10/plugins/code/code.min.js': '4.1.10/plugins/code/code.js',
          '4.1.10/plugins/code/prettify.min.js': '4.1.10/plugins/code/prettify.js',
          '4.1.10/plugins/emoticons/emoticons.min.js': '4.1.10/plugins/emoticons/emoticons.js',
          '4.1.10/plugins/filemanager/filemanager.min.js': '4.1.10/plugins/filemanager/filemanager.js',
          '4.1.10/plugins/flash/flash.min.js': '4.1.10/plugins/flash/flash.js',
          '4.1.10/plugins/image/image.min.js': '4.1.10/plugins/image/image.js',
          '4.1.10/plugins/insertfile/insertfile.min.js': '4.1.10/plugins/insertfile/insertfile.js',
          '4.1.10/plugins/lineheight/lineheight.min.js': '4.1.10/plugins/lineheight/lineheight.js',
          '4.1.10/plugins/link/link.min.js': '4.1.10/plugins/link/link.js',
          '4.1.10/plugins/map/map.min.js': '4.1.10/plugins/map/map.js',
          '4.1.10/plugins/media/media.min.js': '4.1.10/plugins/media/media.js',
          '4.1.10/plugins/multiimage/multiimage.min.js': '4.1.10/plugins/multiimage/multiimage.js',
          '4.1.10/plugins/pagebreak/pagebreak.min.js': '4.1.10/plugins/pagebreak/pagebreak.js',
          '4.1.10/plugins/plainpaste/plainpaste.min.js': '4.1.10/plugins/plainpaste/plainpaste.js',
          '4.1.10/plugins/preview/preview.min.js': '4.1.10/plugins/preview/preview.js',
          '4.1.10/plugins/quickformat/quickformat.min.js': '4.1.10/plugins/quickformat/quickformat.js',
          '4.1.10/plugins/table/table.min.js': '4.1.10/plugins/table/table.js',
          '4.1.10/plugins/template/template.min.js': '4.1.10/plugins/template/template.js',
          '4.1.10/plugins/wordpaste/wordpaste.min.js': '4.1.10/plugins/wordpaste/wordpaste.js',
          '4.1.11/lang/ar.min.js': '4.1.11/lang/ar.js',
          '4.1.11/lang/en.min.js': '4.1.11/lang/en.js',
          '4.1.11/lang/ko.min.js': '4.1.11/lang/ko.js',
          '4.1.11/lang/ru.min.js': '4.1.11/lang/ru.js',
          '4.1.11/lang/zh-CN.min.js': '4.1.11/lang/zh-CN.js',
          '4.1.11/lang/zh-TW.min.js': '4.1.11/lang/zh-TW.js',
          '4.1.11/plugins/anchor/anchor.min.js': '4.1.11/plugins/anchor/anchor.js',
          '4.1.11/plugins/autoheight/autoheight.min.js': '4.1.11/plugins/autoheight/autoheight.js',
          '4.1.11/plugins/baidumap/baidumap.min.js': '4.1.11/plugins/baidumap/baidumap.js',
          '4.1.11/plugins/clearhtml/clearhtml.min.js': '4.1.11/plugins/clearhtml/clearhtml.js',
          '4.1.11/plugins/code/code.min.js': '4.1.11/plugins/code/code.js',
          '4.1.11/plugins/code/prettify.min.js': '4.1.11/plugins/code/prettify.js',
          '4.1.11/plugins/emoticons/emoticons.min.js': '4.1.11/plugins/emoticons/emoticons.js',
          '4.1.11/plugins/filemanager/filemanager.min.js': '4.1.11/plugins/filemanager/filemanager.js',
          '4.1.11/plugins/fixtoolbar/fixtoolbar.min.js': '4.1.11/plugins/fixtoolbar/fixtoolbar.js',
          '4.1.11/plugins/flash/flash.min.js': '4.1.11/plugins/flash/flash.js',
          '4.1.11/plugins/image/image.min.js': '4.1.11/plugins/image/image.js',
          '4.1.11/plugins/insertfile/insertfile.min.js': '4.1.11/plugins/insertfile/insertfile.js',
          '4.1.11/plugins/lineheight/lineheight.min.js': '4.1.11/plugins/lineheight/lineheight.js',
          '4.1.11/plugins/link/link.min.js': '4.1.11/plugins/link/link.js',
          '4.1.11/plugins/map/map.min.js': '4.1.11/plugins/map/map.js',
          '4.1.11/plugins/media/media.min.js': '4.1.11/plugins/media/media.js',
          '4.1.11/plugins/multiimage/multiimage.min.js': '4.1.11/plugins/multiimage/multiimage.js',
          '4.1.11/plugins/pagebreak/pagebreak.min.js': '4.1.11/plugins/pagebreak/pagebreak.js',
          '4.1.11/plugins/plainpaste/plainpaste.min.js': '4.1.11/plugins/plainpaste/plainpaste.js',
          '4.1.11/plugins/preview/preview.min.js': '4.1.11/plugins/preview/preview.js',
          '4.1.11/plugins/quickformat/quickformat.min.js': '4.1.11/plugins/quickformat/quickformat.js',
          '4.1.11/plugins/table/table.min.js': '4.1.11/plugins/table/table.js',
          '4.1.11/plugins/template/template.min.js': '4.1.11/plugins/template/template.js',
          '4.1.11/plugins/wordpaste/wordpaste.min.js': '4.1.11/plugins/wordpaste/wordpaste.js'
        }
      }
    },
    cssmin: { //css minified
      build: {
        files: {
          '4.1.10/themes/default/default.min.css': "4.1.10/themes/default/default.css",
          '4.1.10/themes/qq/qq.min.css': "4.1.10/themes/qq/qq.css",
          '4.1.10/themes/simple/simple.min.css': '4.1.10/themes/simple/simple.css',
          '4.1.10/plugins/code/prettify.min.css': '4.1.10/plugins/code/prettify.css',
          '4.1.11/themes/default/default.min.css': "4.1.11/themes/default/default.css",
          '4.1.11/themes/qq/qq.min.css': "4.1.11/themes/qq/qq.css",
          '4.1.11/themes/simple/simple.min.css': '4.1.11/themes/simple/simple.css',
          '4.1.11/plugins/code/prettify.min.css': '4.1.11/plugins/code/prettify.css'
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.registerTask('default', ['uglify','cssmin']);
}

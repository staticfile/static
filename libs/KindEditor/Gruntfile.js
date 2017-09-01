module.exports = function (grunt) {
  grunt.initConfig({
    uglify: { //js minified
      build: {
        files: {
          '4.1.10/plugins/media/media.min.js': '4.1.10/plugins/media/media.js',
          '4.1.10/plugins/multiimage/multiimage.min.js': '4.1.10/plugins/multiimage/multiimage.js',
          '4.1.10/plugins/pagebreak/pagebreak.min.js': '4.1.10/plugins/pagebreak/pagebreak.js',
          '4.1.10/plugins/plainpaste/plainpaste.min.js': '4.1.10/plugins/plainpaste/plainpaste.js',
          '4.1.10/plugins/preview/preview.min.js': '4.1.10/plugins/preview/preview.js',
          '4.1.10/plugins/quickformat/quickformat.min.js': '4.1.10/plugins/quickformat/quickformat.js',
          '4.1.10/plugins/table/table.min.js': '4.1.10/plugins/table/table.js',
          '4.1.10/plugins/template/template.min.js': '4.1.10/plugins/template/template.js',
          '4.1.10/plugins/wordpaste/wordpaste.min.js': '4.1.10/plugins/wordpaste/wordpaste.js'
        }
      }
    },
    cssmin: { //css minified
      build: {
        files: {
          '4.1.10/themes/default/default.min.css': "4.1.10/themes/default/default.css",
          '4.1.10/themes/qq/qq.min.css': "4.1.10/themes/qq/qq.css",
          '4.1.10/themes/simple/simple.min.css': '4.1.10/themes/simple/simple.css',
          '4.1.10/plugins/code/prettify.min.css': '4.1.10/plugins/code/prettify.css'
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.registerTask('default', ['uglify','cssmin']);
}

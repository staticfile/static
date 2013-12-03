/* jshint node: true */

module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/**\n' +
              '* then.js v<%= pkg.version %> by @zensh\n' +
              '*/\n',
    // Task configuration.
    clean: ["then.min.js"],

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      then: {
        src: 'then.js'
      },
      Gruntfile: {
        src: 'Gruntfile.js'
      },
      testjs: {
        src: 'test/*.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      thenjs: {
        dest: 'then.min.js',
        src: 'then.js'
      }
    },

    nodeunit: {
      all: ['test/nodeunit_test.js']
    }

  });


  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Default task.
  grunt.registerTask('default', ['clean', 'jshint', 'uglify', 'nodeunit']);
  grunt.registerTask('test', ['nodeunit']);
};
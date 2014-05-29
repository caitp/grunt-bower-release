'use strict';

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        asi: true,
        node: true,
        validthis: true
      },
      files: {
        src: ['tasks/**/*.js','<%= nodeunit.tests %>']
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['test/tmp']
    },

    // Configuration to be run (and then tested).
    bowerRelease: {
      options: {
        main: 'library.min.js',
        dependencies: {
          'jquery': '~2.0.3'
        }
      },
      stable: {
        options: {
          endpoint: 'git://github.com/someone/some-package-bower-stable.git',
          stageDir: '../tmp/staging-stable'
        },
        files: [
          {
            expand: true,
            cwd: 'build/',
            src: ['library.js', 'library.min.js', 'css/**/*.css']
          }
        ]
      },
      devel: {
        options: {
          endpoint: 'git://github.com/someone/some-package-bower-devel.git',
          packageName: 'library.js',
          stageDir: '../tmp/staging-devel'
        },
        files: [
          {
            expand: true,
            cwd: 'build/',
            src: ['*.*', 'css/**/*.*']
          }
        ]
      },
      overwriteTag: {
        options: {
          endpoint: 'git://github.com/someone/some-package-bower-overwritetag.git',
          stageDir: '../tmp/staging-overwritetag',
          overwriteTag: true
        },
        files: [
          {
            expand: true,
            cwd: 'build/',
            src: ['library.js']
          }
        ]
      },
      removeVersionTags: {
        options: {
          endpoint: 'git://github.com/someone/some-package-bower-removeversiontags.git',
          stageDir: '../tmp/staging-removeVersionTags',
          removeVersionTags: true
        },
        files: [
          {
            expand: true,
            cwd: 'build/',
            src: ['library.js']
          }
        ]
      },
      suffixTagWithTimestamp: {
        options: {
          endpoint: 'git://github.com/someone/some-package-bower-suffixtagwithtimestamp.git',
          stageDir: '../tmp/staging-suffixTagWithTimestamp',
          suffixTagWithTimestamp: true
        },
        files: [
          {
            expand: true,
            cwd: 'build/',
            src: ['library.js']
          }
        ]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js', 'test/unit/**/*-test.js']
    }
  });

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Default task.
  grunt.registerTask('default', ['jshint', 'test']);

  grunt.registerTask('testRunTearDown', function(){
    process.chdir('../../');
  });

  grunt.registerTask('testRunSetup', function(){
    var fs = require('fs')
    process.chdir('test/fixtures/');
    fs.mkdirSync('../tmp');
    grunt.config('bowerRelease.options.endpointType', 'test');
    grunt.option('debug', true); // set debug true so we don't delete stage folders
  });

  grunt.registerTask('test', ['clean', 'testRunSetup', 'bowerRelease', 'testRunTearDown', 'nodeunit', 'clean']);
};

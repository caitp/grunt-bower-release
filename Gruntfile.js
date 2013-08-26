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
        src: ['tasks/**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task.
  grunt.registerTask('default', ['jshint']);
};

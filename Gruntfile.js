/*
 * To run this file:
 *  `npm install --dev`
 *  `npm install -g grunt`
 *
 *  `grunt --help`
 */

var fs = require('fs');
var browserify = require('browserify');
var pkg = require('./package.json');

module.exports = function(grunt) {
  grunt.initConfig({
    mochaTest: {
      test: {
        options: {
          style: 'bdd',
          reporter: 'spec'
        },
        src: ['test/unit/*.js']
      }
    },
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*\n' + grunt.file.read('LICENSE') + '*/'
      },
      dist: {
        files: {
          'browser.min.js': ['browser.js']
        }
      }
    }
  });

  grunt.registerTask('build', 'build a browser file', function() {
    var done = this.async();
    var outfile = './browser.js';
    var bundle = browserify(pkg.main).bundle(function(err, src) {
      console.log('> ' + outfile);

      // prepend license
      var license = fs.readFileSync('./LICENSE');
      src = '/*\n' + license + '*/' + src;

      // write out the browser file
      fs.writeFileSync(outfile, src);
      done();
    });
  });
  
  grunt.registerTask('build-min', 'uglify');
  grunt.registerTask('test', 'mochaTest');
  grunt.registerTask('default', ['build', 'build-min', 'test']);
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-uglify');
};

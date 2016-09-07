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
var grunt = require('grunt');
require('load-grunt-tasks')(grunt);

module.exports = function(grunt) {
  grunt.initConfig({
    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015']
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['*.js'],
          dest: 'dist/'
        },{
          expand: true,
          cwd: 'src/utilities',
          src: ['*.js'],
          dest: 'dist/utilities'
        },{
          expand: true,
          cwd: 'src/recurrent',
          src: ['*.js'],
          dest: 'dist/recurrent'
        },{
          expand: true,
          cwd: 'src/recurrent/matrix',
          src: ['*.js'],
          dest: 'dist/recurrent/matrix'
        }]
      }
    },
    mochaTest: {
      test: {
        options: {
          style: 'bdd',
          reporter: 'spec',
          require: 'babel-register'
        },
        src: [
          'test/cross-validation/*.js',
          'test/unit/*.js'
        ]
      }
    },
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      options: {
        banner: '/*\n' + grunt.file.read('LICENSE') + '*/',
        version: grunt.file.readJSON('package.json').version
      },
      browser: {
        src: ['dist/*.js', 'dist/utilities/*.js'],
        dest: 'browser.js'
      }
    },
    uglify: {
      options: {
        banner: '/*\n' + grunt.file.read('LICENSE') + '*/',
      },
      dist: {
        files: {
          'browser.min.js': ['browser.js']
        }
      }
    }
  });

  //we need to keep these up to date
  if (grunt.file.readJSON('package.json').version !== grunt.file.readJSON('bower.json').version) {
    console.log('Error: bower.json & package.json version mismatch');
    process.exit(0);
  }

  grunt.registerTask('test', 'mochaTest');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['babel', 'test', 'browserify', 'uglify']);
};

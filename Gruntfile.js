/*
 * To run this file:
 *  `npm install --dev`
 *  `npm install -g grunt`
 *
 *  `grunt --help`
 */

var fs = require("fs"),
    browserify = require("browserify"),
    pkg = require("./package.json");

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
        banner: "/*\n" + grunt.file.read('LICENSE') + "*/"
      },
      dist: {
        files: {
          '<%=pkg.name%>-<%=pkg.version%>.min.js': ['<%=pkg.name%>-<%=pkg.version%>.js']
        }
      }
    }
  });

  grunt.registerTask('build', 'build a browser file', function() {
    var outfile = './browser.js';
    console.log('> ' + outfile);
    // prepend license
    var license = fs.readFileSync('./LICENSE'),
      crossValidate = fs.readFileSync('./lib/cross-validate.js'),
      likelye = fs.readFileSync('./lib/likely.js'),
      lookup = fs.readFileSync('./lib/lookup.js'),
      NeuralNet = fs.readFileSync('./lib/neural-network.js');
    // write out the browser file
    fs.writeFileSync(outfile, '/*\n' + license + '*/\n' + wrapInStrictClosure('brain', unnode(crossValidate, likelye, lookup, NeuralNet)));
    console.log('SUCCESS!');
  });
  grunt.registerTask('test', 'mochaTest');

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-uglify');
};

function unnode() {
  var results = [];

  for (var i in arguments) {
    if (arguments.hasOwnProperty(i) && !isNaN(i))
    results.push(arguments[i].toString()
      /**
       * removes
       * `var name = require('name');`
       * `var aName = require('a-name');`
       * ```
       * var name = require('name'),
       *  aName = require('a-name');
       * ```
       * */

      .replace(/(\n*(var)?\s*[A-Za-z]+\s*[=]\s*require[(]['][a-z-/]+['][)][;,][\n]*)+/g, '')

      /**
       * removes
       * `module.exports = Something;`
       * */
      .replace(/\n*(module[.])?exports\s*[=]\s*[A-Za-z]+[;]/g, '')

      /**
       * removes
       * `module.exports.Something = Something;`
       * */
      .replace(/\n*(module[.])?exports[.][A-Za-z]+\s*[=]\s*[A-Za-z]+[;]/g, '')

      /**
       * removes
       * `module.exports = ` with a lookahead of `function`
       */
      .replace(/\n*(module[.])?exports\s*[=]\s*(?=function)/g, ''));
  }

  return results.join('\n');
}

function wrapInStrictClosure(name, source) {
  return [
    'var ' + name + '={};',
    '(function(){',
    '\'use strict\';',
    source,
    'return ' + name + ';',
    '})();'
  ].join('\n');
}
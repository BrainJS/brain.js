/*
  Turns CommonJS package into a browser file and minifies.
  
  uses node-jake http://github.com/mde/node-jake
  run with 'jake [build|minify|clean]'
*/
var fs = require("fs"),
    path = require("path"),
    util = require('util')
    build = require("./build");
   
var pkg = JSON.parse(fs.readFileSync("package.json")); 
var prefix = pkg.name + "-" + pkg.version;

task('build', [], function (dest) {
  util.puts("building...");
  dest = dest || prefix + ".js";
  build.build(dest);
  util.puts("> " + dest);
});

task('minify', [], function (file, dest) {
  file = file || prefix + ".js";
  dest = dest || prefix + ".min.js";

  var minified = minify(fs.readFileSync(file, "utf-8"));
  fs.writeFileSync(dest, minified, "utf-8");
  util.puts("> " + dest)
});

task('clean', [], function () {
  fs.unlink(prefix + ".js");
  fs.unlink(prefix + ".min.js");
});

function minify(code) {
  var uglifyjs = require("uglify-js"),
      parser = uglifyjs.parser,
      uglify = uglifyjs.uglify;

  var ast = parser.parse(code);
  ast = uglify.ast_mangle(ast);
  ast = uglify.ast_squeeze(ast);
  return uglify.gen_code(ast);
}

/*
  Turns CommonJS package into a browser file.
  Minifying requires UglifyJS (http://github.com/mishoo/UglifyJS)
  to be in the dir above this one.
  
  uses node-jake http://github.com/mde/node-jake
  run with 'jake [build|minify|clean]'
*/
var fs = require("fs"),
    path = require("path"),
    sys = require("sys");

task('build', [], function (name, dest) {
  sys.puts("building...");
  var pkg = getPackage();
  name = name || pkg.name;
  dest = dest || name + ".js";

  var code = "var " + name + " = " + getCode(pkg.main + ".js", " ");
  fs.writeFileSync(dest, code, "utf-8");
  sys.puts("> " + dest);
});

task('minify', [], function (file, dest) {
  var name = getPackage().name;
  file = file || name + ".js";
  dest = dest || name + ".min.js";

  var minified = minify(fs.readFileSync(file, "utf-8"));
  fs.writeFileSync(dest, minified, "utf-8");
  sys.puts("> " + dest)
});

task('clean', [], function () {
  var name = getPackage().name;
  fs.unlink(name + ".js");
  fs.unlink(name + ".min.js");
});


function getPackage() {
  return JSON.parse(fs.readFileSync("package.json"));
}

function getCode(file, indent) {
  sys.puts(indent + file);
  var code = fs.readFileSync(file, "utf-8");

  // replace all the require("mod")s with their code
  // can't handle dep cycles
  var re = /require\(["'](.+?)["']\)/g;
  function expand(match, mod) {
    if(mod.indexOf(".") != 0)
      return "window"; // external dep, assume it will be global
    var dep = path.join(path.dirname(file), mod + ".js");
    return getCode(dep, indent + "    ");
  }
  code = code.replace(re, expand);

  return "(function() {\n\
    var module = { exports: {}};\n\
    var exports = module.exports;\n"
    + code +
   "\nreturn module.exports;\
   })()";  
}

function minify(code) {
  var uglifyjs = require("uglify-js"),
      parser = uglifyjs.parser,
      uglify = uglifyjs.uglify;

  var ast = parser.parse(code);
  ast = uglify.ast_mangle(ast);
  ast = uglify.ast_squeeze(ast);
  return uglify.gen_code(ast);
}

/*
  Turns CommonJS package into a browser file.
  Requires UglifyJS (http://github.com/mishoo/UglifyJS)
  to be in the dir above this one.
  
  uses node-jake http://github.com/mde/node-jake
  run with 'jake [browser|minify|clean]'
*/

var jsp = require("../UglifyJS/lib/parse-js"),
    pro = require("../UglifyJS/lib/process"),
    fs = require("fs"),
    path = require("path"),
    sys = require("sys");

task('browser', [], function () {
  // stitch everything under 'lib' together
  var files = readdirDeepSync("lib");
  var code = stitch(files);

  // replace require("x")s
  var externals = ["underscore"];
  var lines = code.split("\n");
  lines = lines.map(function(line) {
    // remove requires for external resources that will be global
    externals.forEach(function(external) {
      line = line.replace(new RegExp('.*require\\(.*' + external + '.*'), ""); 
    });
    line = line.replace(/require\(.*?\)/, "exports");
    return line;
  });
  code = lines.join("\n");

  // namespace it
  code = license() + header("brain") + code + footer();
  
  fs.writeFileSync("brain.js", code, "utf-8");
});

task('minify', [], function (filename) {
  var filename = filename || "brain.js";
  var minified = minify(fs.readFileSync(filename, "utf-8"))
  fs.writeFileSync("brain-min.js", minified, "utf-8");
});

task('clean', [], function (filename) {
  fs.unlink("brain.js");
  fs.unlink("brain-min.js");
});


/* utils */
function minify(code) {
  var ast = jsp.parse(code);
  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);
  return pro.gen_code(ast);
}

function license(filename) {
  filename = filename || "LICENSE";
  var license = fs.readFileSync(filename, "utf-8");
  return "/*\n" + license + "\n*/\n\n"
}

function header(namespace) {
 return "var " + namespace + " = (function() {\n\
   var exports = {};\n";
}

function footer() {
  return "return exports;\n\
    })();\n"; 
}

function stitch(files) {
  var codez = [];
  files.forEach(function(file) {
    codez.push(fs.readFileSync(file, "utf-8"));
  });
  return codez.join("\n");
}

function readdirDeepSync(dir) {
  var files = [];
  fs.readdirSync(dir).forEach(function(file) {
    var fname = path.join(dir, file);
    var stats = fs.statSync(fname);
    if(stats.isDirectory()) {
      files = files.concat(readdirDeepSync(fname));
    } else {
      files.push(fname);
    }
  });
  return files;
}

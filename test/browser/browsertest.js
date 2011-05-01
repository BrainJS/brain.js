var connect = require('connect'),
    fs = require("fs"),
    path = require("path"),
    sys = require("sys");

var root = path.join(__dirname, "files");

exports.runTests = function() {
  build(path.resolve(__dirname, "../../package.json"));

  connect.createServer(
    connect.static(root)
  ).listen(3000);

  sys.puts("visit http://127.0.0.1:3000/index.html");
}

/* todo - use same code as Jakefile */
function build(pkgFile, name, dest) {
  sys.puts("building...");
  var pkg = JSON.parse(fs.readFileSync(pkgFile || "package.json"));
  name = name || pkg.name;
  dest = dest || path.join(root, name + ".js");
  var main = path.join(path.dirname(pkgFile), pkg.main + ".js");
  var code = "var " + name + " = " + getCode(main, " ");
  fs.writeFileSync(dest, code, "utf-8");
  sys.puts("> " + dest);
};

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
var fs = require("fs");

exports.build = function(dest) {
  var source = require("browserify").bundle({
    name: "brain",
    base: __dirname + "/lib",
    main: __dirname + "/lib/brain.js",
    require: "underscore",
    shim: false
  });
  
  source = "var brain = (function() {" + source + " return require('brain')})();"

  fs.writeFileSync(dest, source);
}
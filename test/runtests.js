var sys = require("sys"),
    fs = require("fs"),
    path = require("path");

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

function testFile(test) {
  var test = test.replace(".js", "");
  try {
    require(test);
    sys.puts("PASS " + path.basename(test));
  }
  catch(e) {
    var msg = "FAIL " + test + ": " +  e;
    if(e.expected != true)
      msg += ", expected: " + JSON.stringify(e.expected)
             + " actual: " + JSON.stringify(e.actual);
    sys.puts(msg);
  }
}


var tests = [];
if(process.argv.length >= 3) {
  /* only run target's directory */
  var target = path.join(__dirname, process.argv[2]);
  tests = fs.readdirSync(target).map(function(test) {
    return path.join(target, test);
  });
}
else {
  /* run all directories of tests */
  fs.readdirSync(__dirname).forEach(function(file) {
    var fname = path.join(__dirname, file);
    if(fs.statSync(fname).isDirectory())
      tests = tests.concat(tests, readdirDeepSync(fname));
  });
}

tests.forEach(testFile);
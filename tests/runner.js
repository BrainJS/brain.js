var sys = require("sys");

var tests = ["json", "hash", "errorthresh", "bitwise", "tofunction", "layers",
             "grow"];

for(var i = 0; i < tests.length; i++) {
  var test = tests[i];
  try {
    require("./"  + test);
    sys.puts("PASS " + test);
  }
  catch(e) {
    var msg = "FAIL " + test + ": " +  e;
    if(e.expected != true)
      msg += ", expected: " + JSON.stringify(e.expected)
             + " actual: " + JSON.stringify(e.actual);
    sys.puts(msg);
  }
}

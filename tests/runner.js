var sys = require("sys");

var tests = ["json", "hash", "errorthresh"];

for(var i = 0; i < tests.length; i++) {
  var test = tests[i];
  try {
    require("./"  + test);
    sys.puts("PASS " + test);
  }
  catch(e) {
    sys.puts("FAIL " + test + ": " +  e);
  }
}

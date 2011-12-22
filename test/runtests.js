var path = require("path"),
    nomnom = require("nomnom"),
    runBrowser = require("./browser/browsertest").runTests,
    runSanity = require("./sanity/sanitytest").runTests,
    runCValidate = require("./cvalidate/cvalidatetest").runTests;


var parser = nomnom()
  .opts({
    type: {
      string: '-t TYPE, --type=TYPE',
      help: "type of classifier to test, 'neuralnet' or 'bayes'"
    }
  });
  
parser.nocommand()
  .callback(function(options) {
    runSanity(options);
    runCValidate(options);
  })
  .opts({
    config: {
      string: '-c FILE, --config=FILE',
      default: path.join(__dirname, "cvalidate" , "cvtests.json"),
      help: 'JSON manifest of cross-validation tests to run'
    }
  })

parser.command('browser')
  .callback(runBrowser)
  .help("run browser tests");
  
parser.command('sanity')
  .callback(runSanity)
  .help("run sanity tests");
  
parser.command('cvalidate')
  .callback(runCValidate)
  .help("run cross-validation tests")
  .opts({
    config: {
      string: '-c FILE, --config=FILE',
      default: path.join(__dirname, "cvalidate" , "cvtests.json"),
      help: 'JSON manifest of cross-validation tests to run'
    },

    db: {
      string: '-d URL, --db=URL',
      help: 'url to CouchDB database of training data'
    },

    options: {
      string: '-o JSON, --options=JSON',
      help: 'options to pass to classifier'
    },

    report: {
      string: '-r COUCHDB, --report=COUCHDB',
      help: 'couch db to post results to'
    },

    reportName: {
      string: '-n NAME, --report-name=NAME',
      help: 'name of results report'
    }
  });
  
parser.parseArgs();
# tests
Running the tests requires [node.js](http://nodejs.org/). To run the suite of API tests:

	node test/runtests.js sanity

### cross-validation tests
The in-repo tests are just sanity/API checks, to really test out the library, run the cross-validation tests. These
test the classifiers on large sets of real training data and give an error value (between 0 and 1) that indicates how good the classifier is at training. You can run the default cross-validation tests with:

	node test/runtests.js cvalidate
	
(requires network access to the dbs of training data). Specify your own db and options to pass in:

	node test/runtests.js cvalidate --type=neuralnet --db=http://localhost:5984/nndata --options='{learningRate:0.6}'

The db must be a [CouchDB](http://couchdb.com) database of JSON objects with 'input' and 'output' fields.

### browser tests
To run the browser tests:

	node test/runtests.js browser
	
This will build a browser file from the current code and host a test page.
# brain

brain is a limited JavaScript supervised machine learning library. [Full API here](http://harthur.github.com/brain). Neural network example:
	var net = new brain.NeuralNetwork();
	net.train([{input: [0, 0], output: [0]},
	           {input: [0, 1], output: [1]},
	           {input: [1, 0], output: [1]},
	           {input: [1, 1], output: [0]}]);
	
	var output = net.run([1, 0]);

The output will be `[0.987]` or something close like that. There's no reason to use a neural network to figure out XOR, but it's a small example (-:

Naive Bayesian classifier example:
	var bayes = new brain.BayesianClassifier();
	
	bayes.train("cheap replica watches", "spam");
	bayes.train("I don't know if this works on Windows", "not");
	
	var category = bayes.classify("free watches");


# using as a commonJS package
To use this as a commonJS package (node/narwhal) checkout or download the code, it's a commonJS package. If you have [node](http://nodejs.org/) and [npm](http://github.com/isaacs/npm) you can:

	npm install brain@latest

then:

	var brain = require("brain");
	var net = new brain.NeuralNetwork();
	
If you didn't install with npm, you can specify the path to the brain.js file, like `require("./lib/brain")`. If you're using the Redis backend for the Bayesian classifier, you'll also need to install [redis-node](http://github.com/bnoguchi/redis-node) as "redis".


# using in the browser
The `NeuralNetwork` works in the browser. Download the latest [brain.js](http://github.com/harthur/brain/downloads). If you can you should train the network offline (or on a Worker) and use the `toFunction()` or `toJSON()` options to plug the trained network in to your website.


# tests
Running the tests requires [node.js](http://nodejs.org/). To run the suite of API tests:

	node test/sanity/runtests.js

### cross-validation tests
The in-repo tests are just sanity/API checks, to really test out the library, run the cross-validation tests. These
test the classifiers on large sets of real training data and give an error value (between 0 and 1) that indicates how good the classifier is at training. You can run the default cross-validation tests with:

	node test/cvalidate/runcv.js
	
(requires network access to the dbs of training data). Specify your own db and options to pass in:

	node test/cvalidate/runcv.js --type=neuralnetwork --db=http://localhost:5984/nndata --options='{learningRate:0.6}'

The db must be a [CouchDB](http://couchdb.com) database of JSON objects with 'input' and 'output' fields.

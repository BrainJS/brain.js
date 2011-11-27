# brain

brain is a limited JavaScript supervised machine learning library. [Full API here](http://harthur.github.com/brain). Neural network example:

	var net = new brain.NeuralNetwork();
	net.train([{input: [0, 0], output: [0]},
	           {input: [0, 1], output: [1]},
	           {input: [1, 0], output: [1]},
	           {input: [1, 1], output: [0]}]);
	
	var output = net.run([1, 0]);

The output will be `[0.987]` or something close like that. There's no reason to use a neural network to figure out XOR (-:, so here's a more involved, realistic example:
[Demo: training a neural network to recognize color contrast](http://harthur.github.com/brain/examples/blackorwhite.html)

Naive Bayesian classifier example:

	var bayes = new brain.BayesianClassifier();
	
	bayes.train("cheap replica watches", "spam");
	bayes.train("I don't know if this works on Windows", "not");
	
	var category = bayes.classify("free watches");


# using in node
If you have [node](http://nodejs.org/) you can install with [npm](http://github.com/isaacs/npm):

	npm install brain

# using in the browser
Download the latest [brain.js](http://github.com/harthur/brain/downloads). If you're using `BayesianClassifier`, you can only use the `localStorage` and (default) in-memory backends. If you're using the `NeuralNetwork` you should try to train the network offline (or on a Worker) and use the `toFunction()` or `toJSON()` options to plug the pre-trained network in to your website.


# tests
Running the tests requires checking out the code and installing the dev dependencies: `npm install --dev`. To run the suite of tests:

	node test/runtests.js
	
To run the other tests: [browser and cross-validation tests](https://github.com/harthur/brain/tree/master/test)

# build
To build a browser file from the CommonJS package you'll need [jake](https://github.com/mde/jake):

	npm install jake -g
	
	jake build
	jake minify

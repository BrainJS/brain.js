# brain

brain is a javascript neural network library. An example, training the XOR bitwise operation:

	var data = [{input: [0, 0], output: [0]},
	            {input: [0, 1], output: [1]},
	            {input: [1, 0], output: [1]},
	            {input: [1, 1], output: [0]}];

	var net = new NeuralNetwork();
	net.train(data);
	var output = net.run([1, 0]);

The output will be `[0.987]` or something close like that. There's no reason to use a neural network to figure out XOR, but it's a small example (-:

# using in the browser
Download the latest client-side [brain.js](http://github.com/harthur/brain/downloads). If you can you should train the network offline (or on a Worker thread) and use the `toFunction()` or `toJSON()` options to plug the trained network in to your website.

# using as a commonJS module
To use this as a commonJS module (node/narwhal) checkout or download the code, then:

	var brain = require("./brain");
	var net = new brain.NeuralNetwork();

# tests
Running the tests requires [node.js](http://nodejs.org/):

	node tests/runner.js


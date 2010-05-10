brain
------------------------------------
brain is a client/server-side javascript neural network library. An example (training the XOR bitwise operation):

	var data = [{input: [0, 0], target: [0]},
	            {input: [0, 1], target: [1]},
	            {input: [1, 0], target: [1]},
	            {input: [1, 1], target: [0]}];

	var net = new NeuralNetwork();
	net.train(data);
	var output = net.run([1, 0]);

the output will be `[0.987]` or something close like that. There's no reason to use a neural network to figure out XOR, but it's a small example (-:

to use this as a commonJS module (node/narwhal):

	var brain = require("./brain");
	var net = new brain.NeuralNetwork();

to use this on the client-side, remove the line `exports.NeuralNetwork = NeuralNetwork` from the bottom of brain.js.


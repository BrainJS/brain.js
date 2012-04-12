# brain
`brain` is a JavaScript [neural network](http://en.wikipedia.org/wiki/Artificial_neural_network) library. Here's an example of using it to approximate the XOR function:

```javascript
var net = new brain.NeuralNetwork();

net.train([{input: [0, 0], output: [0]},
           {input: [0, 1], output: [1]},
           {input: [1, 0], output: [1]},
           {input: [1, 1], output: [0]}]);

var output = net.run([1, 0]);  // [0.987]
```

There's no reason to use a neural network to figure out XOR however (-: so here's a more involved, realistic example:
[Demo: training a neural network to recognize color contrast](http://harthur.github.com/brain/examples/blackorwhite.html)

# using in node
If you have [node](http://nodejs.org/) you can install with [npm](http://github.com/isaacs/npm):

	npm install brain

# using in the browser
Download the latest [brain.js](http://github.com/harthur/brain/downloads). Training is computationally expensive, so you should try to train the network offline (or on a Worker) and use the `toFunction()` or `toJSON()` options to plug the pre-trained network in to your website.

# Training
Use `train()` to train the network with an array of training data. Each piece of training data should have an `input` and an `output`, both of which can be either an array of numbers from 0 to 1 or a hash of numbers from 0 to 1. For the [color constrast demo](http://harthur.github.com/brain/examples/blackorwhite.html) it looks something like this:

```javascript
var net = new brain.NeuralNetwork();

net.train([{input: { r: 0.03, g: 0.7, b: 0.5 }, output: { black: 1 }},
           {input: { r: 0.16, g: 0.09, b: 0.2 }, output: { white: 1 }},
           {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}]);

var output = net.run({ r: 1, g: 0.4, b: 0 });  // { white: 0.99 black: 0.002 }
```

The network has to be trained with all the data in bulk in one call to `train()`. The more training data the longer it will take to train, but the better the network will be at classifiying new data.

# JSON
Serialize or load in the state of a trained network with JSON:

```javascript
var json = net.toJSON();

net.fromJSON(json);
```

You can also get a custom standalone function from a trained network that acts just like `run()`:

```javascript
var run = net.toFunction();

var output = run({r: 1, g: 0.4, b: 0});
```




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

# Using in node
If you have [node](http://nodejs.org/) you can install with [npm](http://github.com/isaacs/npm):

	npm install brain

# Using in the browser
Download the latest [brain.js](http://github.com/harthur/brain/downloads). Training is computationally expensive, so you should try to train the network offline (or on a Worker) and use the `toFunction()` or `toJSON()` options to plug the pre-trained network in to your website.

# Training

#### Data format
Use `train()` to train the network with an array of training data. Each piece of training data should have an `input` and an `output`, both of which can be either an array of numbers from `0` to `1` or a hash of numbers from `0` to `1`. For the [color constrast demo](http://harthur.github.com/brain/examples/blackorwhite.html) it looks something like this:

```javascript
var net = new brain.NeuralNetwork();

net.train([{input: { r: 0.03, g: 0.7, b: 0.5 }, output: { black: 1 }},
           {input: { r: 0.16, g: 0.09, b: 0.2 }, output: { white: 1 }},
           {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}]);

var output = net.run({ r: 1, g: 0.4, b: 0 });  // { white: 0.99, black: 0.002 }
```

The network has to be trained with all the data in bulk in one call to `train()`. The more training data, the longer it will take to train, but the better the network will be at classifiying new data.

#### Threshold
The optional second argument to `train()` is the error threshold (default `0.002`), the third is the maximum training iterations (default `10000`).

The network will train until the training error has gone below the threshold or the max number of iterations has been reached, whichever comes first.

#### Output
The ouput of `train()` is a hash:

```
{
  error: 0.0019139985510105032,  // training error
  iterations: 404                // training iterations
}
```

#### Failing
If the network failed to train, the error will be above the error threshold. This could happen because the training data is too noisy (most likely), the network doesn't have enough hidden layers or nodes to handle the complexity of the data, or it hasn't trained for enough iterations.

If the training error is still something huge like `0.4` after 10000 iterations, it's a good sign that the network can't make any sense of the data you're giving it.

# JSON
Serialize or load in the state of a trained network with JSON:

```javascript
var json = net.toJSON();

net.fromJSON(json);
```

You can also get a custom standalone function from a trained network that acts just like `run()`:

```javascript
var run = net.toFunction();

var output = run({ r: 1, g: 0.4, b: 0 });

console.log(run.toString()); // copy and paste! no need to import brain.js
```

# Options
`NeuralNetwork()` takes a hash of options:

```javascript
var net = new NeuralNetwork({
   hidden: [4],
   learningRate: 0.6
});
```

#### hidden
Specify the number of hidden layers in the network and the size of each layer. For example, if you want two hidden layers - the first with 3 nodes and the second with 4 nodes, you'd give:

```
hidden: [3, 4]
```

By default `brain` uses one hidden layer with size proportionate to the size of the input array.

#### learningRate
The learning rate is a parameter that influences how quickly the network trains. It's a number from `0` to `1`. If the learning rate is close to `0` it will take a lot longer to train. If the learning rate is closer to `1` it will train faster but it's in danger of training to a local minimum and performing badly on new data. The default learning rate is `0.5`.


# Bayesian classifier

The Bayesian classifier that used to be here has moved to its own library, [classifier](https://github.com/harthur/classifier).

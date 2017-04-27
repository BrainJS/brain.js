![](logo.png)

# brain

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/harthur/brain?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

`brain.js` is a library of JavaScript [neural networks](http://en.wikipedia.org/wiki/Artificial_neural_network).

:bulb: **Note**: This is a continuation of the [**harthur/brain**](https://github.com/harthur/brain) repository (which is not maintained anymore). For more details, check out [this issue](https://github.com/harthur/brain/issues/72).

Here's an example of using it to approximate the XOR function:

```javascript
//create a simple feed forward neural network with backpropagation
var net = new brain.NeuralNetwork();

net.train([{input: [0, 0], output: [0]},
           {input: [0, 1], output: [1]},
           {input: [1, 0], output: [1]},
           {input: [1, 1], output: [0]}]);

var output = net.run([1, 0]);  // [0.987]
```
or
```javascript
//create a simple recurrent neural network
var net = new brain.recurrent.RNN();

net.train([{input: [0, 0], output: [0]},
           {input: [0, 1], output: [1]},
           {input: [1, 0], output: [1]},
           {input: [1, 1], output: [0]}]);

var output = net.run([0, 0]);  // [0]
output = net.run([0, 1]);  // [1]
output = net.run([1, 0]);  // [1]
output = net.run([1, 1]);  // [0]
```

There's no reason to use a neural network to figure out XOR however (-: so here's a more involved, realistic example:
[Demo: training a neural network to recognize color contrast](http://harthur-org.github.io/brain.js/)

## Using in node
If you have [node](http://nodejs.org/) you can install with [npm](http://npmjs.org):

```
npm install brain.js
```
Alternatively, you can install with [bower](https://bower.io/)):
```
bower install brain.js
```
At present NPM brain.js version is approximately 1.0.0, featuring only Feed Forward NN. All other models are beta and soon be jazzed up and battle hardened.
You can still download the latest. They are cool!

## Using in the browser
Download the latest [brain.js for browser](https://raw.githubusercontent.com/harthur-org/brain.js/master/browser.js). Training is computationally expensive, so you should try to train the network offline (or on a Worker) and use the `toFunction()` or `toJSON()` options to plug the pre-trained network in to your website.

## Training
Use `train()` to train the network with an array of training data. The network has to be trained with all the data in bulk in one call to `train()`. The more training patterns, the longer it will probably take to train, but the better the network will be at classifiying new patterns.

#### Data format
Each training pattern should have an `input` and an `output`, both of which can be either an array of numbers from `0` to `1` or a hash of numbers from `0` to `1`. For the [color contrast demo](http://harthur-org.github.io/brain.js/) it looks something like this:

```javascript
var net = new brain.NeuralNetwork();

net.train([{input: { r: 0.03, g: 0.7, b: 0.5 }, output: { black: 1 }},
           {input: { r: 0.16, g: 0.09, b: 0.2 }, output: { white: 1 }},
           {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}]);

var output = net.run({ r: 1, g: 0.4, b: 0 });  // { white: 0.99, black: 0.002 }
```
Another variation of the example above. Note that input objects do not need to be similar.
```javascript
net.train([{input: { r: 0.03, g: 0.7 }, output: { black: 1 }},
           {input: { r: 0.16, b: 0.2 }, output: { white: 1 }},
           {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}]);

var output = net.run({ r: 1, g: 0.4, b: 0 });  // { white: 0.81, black: 0.18 }
```


#### Options
`train()` takes a hash of options as its second argument:

```javascript
net.train(data, {
  errorThresh: 0.005,  // error threshold to reach
  iterations: 20000,   // maximum training iterations
  log: true,           // console.log() progress periodically
  logPeriod: 10,       // number of iterations between logging
  learningRate: 0.3    // learning rate
});
```

The network will train until the training error has gone below the threshold (default `0.005`) or the max number of iterations (default `20000`) has been reached, whichever comes first.

By default training won't let you know how its doing until the end, but set `log` to `true` to get periodic updates on the current training error of the network. The training error should decrease every time. The updates will be printed to console. If you set `log` to a function, this function will be called with the updates instead of printing to the console.

The learning rate is a parameter that influences how quickly the network trains. It's a number from `0` to `1`. If the learning rate is close to `0` it will take longer to train. If the learning rate is closer to `1` it will train faster but it's in danger of training to a local minimum and performing badly on new data. The default learning rate is `0.3`.

#### Methods
##### `train`
The output of `train()` is a hash of information about how the training went:

```javascript
{
  error: 0.0039139985510105032,  // training error
  iterations: 406                // training iterations
}
```

#### Failing
If the network failed to train, the error will be above the error threshold. This could happen because the training data is too noisy (most likely), the network doesn't have enough hidden layers or nodes to handle the complexity of the data, or it hasn't trained for enough iterations.

If the training error is still something huge like `0.4` after 20000 iterations, it's a good sign that the network can't make sense of the data you're giving it.

## JSON
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

## Options
`NeuralNetwork()` takes a hash of options:

```javascript
var net = new brain.NeuralNetwork({
  hiddenLayers: [4],
  learningRate: 0.6 // global learning rate, useful when training using streams
});
```

#### hiddenLayers
Specify the number of hidden layers in the network and the size of each layer. For example, if you want two hidden layers - the first with 3 nodes and the second with 4 nodes, you'd give:

```
hiddenLayers: [3, 4]
```

By default `brain.js` uses one hidden layer with size proportionate to the size of the input array.

## Streams
The network now has a [WriteStream](http://nodejs.org/api/stream.html#stream_class_stream_writable). You can train the network by using `pipe()` to send the training data to the network.

#### Example
Refer to `stream-example.js` for an example on how to train the network with a stream.

#### Initialization
To train the network using a stream you must first create the stream by calling `net.createTrainStream()` which takes the following options:

* `floodCallback()` - the callback function to re-populate the stream. This gets called on every training iteration.
* `doneTrainingCallback(info)` - the callback function to execute when the network is done training. The `info` param will contain a hash of information about how the training went:

```javascript
{
  error: 0.0039139985510105032,  // training error
  iterations: 406                // training iterations
}
```

#### Transform
Use a [Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform) to coerce the data into the correct format. You might also use a Transform stream to normalize your data on the fly.

## Utilities
### `likely`
```js
var likely = require('brain/likely');
var key = likely(input, net);
```
See: https://github.com/harthur-org/brain.js/blob/master/test/base/likely.js

## Neural Network Types
* [`brain.NeuralNetwork`](src/neural-network.js) - [Feedforward Neural Network](https://en.wikipedia.org/wiki/Feedforward_neural_network) with backpropagation
* [`brain.recurrent.RNN`](src/recurrent/rnn.js) - [Recurrent Neural Network or "RNN"](https://en.wikipedia.org/wiki/Recurrent_neural_network)
* [`brain.recurrent.LSTM`](src/recurrent/lstm.js) - [Long Short Term Memory Neural Network or "LSTM"](https://en.wikipedia.org/wiki/Long_short-term_memory)
* [`brain.recurrent.GRU`](src/recurrent/gru.js) - [Gated Recurrent Unit or "GRU"](https://en.wikipedia.org/wiki/Gated_recurrent_unit)

### Why different Neural Network Types?
Different neural nets do different things well.  For example:
* A Feedforward Neural Network can classify simple things very well, but it has no memory of previous actions and has infinite variation of results.
* A Recurrent Neural Network _remembers_, and has a finite set of results.

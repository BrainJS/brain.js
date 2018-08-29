
# brain.js

<img src="https://cdn.rawgit.com/harthur-org/brain.js/ff595242/logo.svg" alt="Logo" width=200px/>

[![npm](https://img.shields.io/npm/dt/brain.js.svg?style=flat-square)](https://npmjs.com/package/brain.js) 
[![Backers on Open Collective](https://opencollective.com/brainjs/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/brainjs/sponsors/badge.svg)](#sponsors) 

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/brain-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Slack](https://slack.bri.im/badge.svg)](https://slack.bri.im)

## About

`brain.js` is a library of [Neural Networks](http://en.wikipedia.org/wiki/Artificial_neural_network) written in JavaScript.

:bulb: **Note**: This is a continuation of the [**harthur/brain**](https://github.com/harthur/brain) repository (which is not maintained anymore). For more details, check out [this issue](https://github.com/harthur/brain/issues/72).

## Table of Contents

- [Examples](#examples)
    + [More Examples](#more-examples)
- [Usage](#usage)
    + [Node](#node)
    + [Browser](#browser)
- [Training](#training)
    + [Data format](#data-format)
      + [For training with NeuralNetwork](#for-training-with-neuralnetwork)
      + [For training with `RNNTimeStep`, `LSTMTimeStep` and `GRUTimeStep`](#for-training-with-rnntimestep-lstmtimestep-and-grutimestep)
      + [For training with `RNN`, `LSTM` and `GRU`](#for-training-with-rnn-lstm-and-gru)
    + [Training Options](#training-options)
    + [Async Training](#async-training)
- [Methods](#methods)
    + [train](#train)
- [Failing](#failing)
- [JSON](#json)
- [Options](#options)
    + [activation](#activation)
    + [hiddenLayers](#hiddenlayers)
- [Streams](#streams)
    + [Example](#example)
    + [Initialization](#initialization)
    + [Transform](#transform)
- [Utilities](#utilities)
    + [`likely`](#likely)
- [Neural Network Types](#neural-network-types)
    + [Why different Neural Network Types?](#why-different-neural-network-types)
    
# Examples
Here's an example showcasing how to approximate the XOR function using `brain.js`:
more info on config [here](https://github.com/BrainJS/brain.js/blob/develop/src/neural-network.js#L31).

```javascript
// provide optional config object (or undefined). Defaults shown.
const config = {
    binaryThresh: 0.5,     // ¯\_(ツ)_/¯
    hiddenLayers: [3],     // array of ints for the sizes of the hidden layers in the network
    activation: 'sigmoid'  // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh']
};

// create a simple feed forward neural network with backpropagation
const net = new brain.NeuralNetwork(config);

net.train([{input: [0, 0], output: [0]},
           {input: [0, 1], output: [1]},
           {input: [1, 0], output: [1]},
           {input: [1, 1], output: [0]}]);

const output = net.run([1, 0]);  // [0.987]
```
or
more info on config [here](https://github.com/BrainJS/brain.js/blob/develop/src/recurrent/rnn.js#L726).

```javascript
// provide optional config object, defaults shown.
const config = {
    inputSize: 20,
    inputRange: 20,
    hiddenSizes: [20,20],
    outputSize: 20,
    learningRate: 0.01,
    decayRate: 0.999,
};

// create a simple recurrent neural network
const net = new brain.recurrent.RNN(config);

net.train([{input: [0, 0], output: [0]},
           {input: [0, 1], output: [1]},
           {input: [1, 0], output: [1]},
           {input: [1, 1], output: [0]}]);

let output = net.run([0, 0]);  // [0]
output = net.run([0, 1]);      // [1]
output = net.run([1, 0]);      // [1]
output = net.run([1, 1]);      // [0]
```

However, there is no reason to use a neural network to figure out XOR. (-: So, here is a more involved, realistic example:
[Demo: training a neural network to recognize color contrast](https://brain.js.org/).

## More Examples
You can check out this fantastic screencast, which explains how to train a simple neural network using a real world dataset: [How to create a neural network in the browser using Brain.js](https://scrimba.com/c/c36zkcb).
* [writing a children's book using a recurrent neural network](./examples/childrens-book.js)
* [simple letter detection](./examples/which-letter-simple.js)

# Usage

### Node
If you have [node](http://nodejs.org/), you can install `brain.js` with [npm](http://npmjs.org):

```
npm install brain.js
```

Or if you prefer yarn:
```
yarn add brain.js
```

At present, the published version of brain.js is approximately 1.0.0, featuring only Feed-forward NN. All other models are beta and are being jazzed up and battle hardened.
You can still download the latest, though. They are cool!

### Browser
Download the latest [brain.js for browser](https://cdn.rawgit.com/BrainJS/brain.js/master/browser.js). Training is computationally expensive, so you should try to train the network offline (or on a Worker) and use the `toFunction()` or `toJSON()` options to plug the pre-trained network into your website.

# Training
Use `train()` to train the network with an array of training data. The network has to be trained with all the data in bulk in one call to `train()`. More training patterns will probably take longer to train, but will usually result in a network better
at classifying new patterns.

### Data format
#### For training with `NeuralNetwork`
Each training pattern should have an `input` and an `output`, both of which can be either an array of numbers from `0` to `1` or a hash of numbers from `0` to `1`. For the [color contrast demo](https://brain.js.org/) it looks something like this:

```javascript
var net = new brain.NeuralNetwork();

net.train([{input: { r: 0.03, g: 0.7, b: 0.5 }, output: { black: 1 }},
           {input: { r: 0.16, g: 0.09, b: 0.2 }, output: { white: 1 }},
           {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}]);

var output = net.run({ r: 1, g: 0.4, b: 0 });  // { white: 0.99, black: 0.002 }
```
Here's another variation of the above example. (_Note_ that input objects do not need to be similar.)
```javascript
net.train([{input: { r: 0.03, g: 0.7 }, output: { black: 1 }},
           {input: { r: 0.16, b: 0.2 }, output: { white: 1 }},
           {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}]);

var output = net.run({ r: 1, g: 0.4, b: 0 });  // { white: 0.81, black: 0.18 }
```

#### For training with `RNNTimeStep`, `LSTMTimeStep` and `GRUTimeStep`
Each training pattern can either:
* Be an array of numbers
* Be an array of arrays of numbers

Example using an array of numbers:
```javascript
var net = new brain.recurrent.LSTMTimeStep();

net.train([
  [1, 2, 3]
]);

var output = net.run([1, 2]);  // 3
```

Example using an array of arrays of numbers:
```javascript
var net = new brain.recurrent.LSTMTimeStep();

net.train([
  [1, 3],
  [2, 2],
  [3, 1],
]);

var output = net.run([[1, 3], [2, 2]]);  // [3, 1]
```

#### For training with `RNN`, `LSTM` and `GRU`
Each training pattern can either:
* Be an array of values
* Be a string
* Have an `input` and an `output`
  * Either of which can an array of values or a string

CAUTION: When using an array of values, you can use ANY value, however, the values are represented in the neural network by a single input.  So the more _distinct values_ has _the larger your input layer_.  If you have a hundreds, thousands, or millions of floating point values _THIS IS NOT THE RIGHT CLASS FOR THE JOB_.  Also, when deviating from strings, this gets into beta

Example using direct strings:
```javascript
var net = new brain.recurrent.LSTM();

net.train([
  'doe, a deer, a female deer',
  'ray, a drop of golden sun',
  'me, a name I call myself',
]);

var output = net.run('doe');  // ', a deer, a female deer'
```

Example using strings with inputs and outputs:
```javascript
var net = new brain.recurrent.LSTM();

net.train([
  { input: 'I feel great about the world!', output: 'happy' },
  { input: 'The world is a terrible place!', output: 'sad' },
]);

var output = net.run('I feel great about the world!');  // 'happy'
```


### Training Options
`train()` takes a hash of options as its second argument:

```javascript
net.train(data, {
                            // Defaults values --> expected validation
      iterations: 20000,    // the maximum times to iterate the training data --> number greater than 0
      errorThresh: 0.005,   // the acceptable error percentage from training data --> number between 0 and 1
      log: false,           // true to use console.log, when a function is supplied it is used --> Either true or a function
      logPeriod: 10,        // iterations between logging out --> number greater than 0
      learningRate: 0.3,    // scales with delta to effect training rate --> number between 0 and 1
      momentum: 0.1,        // scales with next layer's change value --> number between 0 and 1
      callback: null,       // a periodic call back that can be triggered while training --> null or function
      callbackPeriod: 10,   // the number of iterations through the training data between callback calls --> number greater than 0
      timeout: Infinity     // the max number of milliseconds to train for --> number greater than 0
});
```

The network will stop training whenever one of the two criteria is met: the training error has gone below the threshold (default `0.005`), or the max number of iterations (default `20000`) has been reached.

By default training will not let you know how it's doing until the end, but set `log` to `true` to get periodic updates on the current training error of the network. The training error should decrease every time. The updates will be printed to console. If you set `log` to a function, this function will be called with the updates instead of printing to the console.

The learning rate is a parameter that influences how quickly the network trains. It's a number from `0` to `1`. If the learning rate is close to `0`, it will take longer to train. If the learning rate is closer to `1`, it will train faster, but training results may be constrained to a local minimum and perform badly on new data.(_Overfitting_) The default learning rate is `0.3`.

The momentum is similar to learning rate, expecting a value from `0` to `1` as well, but it is multiplied against the next level's change value. The default value is `0.1`

Any of these training options can be passed into the constructor or passed into the `updateTrainingOptions(opts)` method and they will be saved on the network and used during the training time. If you save your network to json, these training options are saved and restored as well (except for callback and log, callback will be forgotten and log will be restored using console.log).

A boolean property called `invalidTrainOptsShouldThrow` is set to `true` by default. While the option is `true`, if you enter a training option that is outside the normal range, an error will be thrown with a message about the abnormal option. When the option is set to `false`, no error will be sent, but a message will still be sent to `console.warn` with the related information.

### Async Training
`trainAsync()` takes the same arguments as train (data and options). Instead of returning the results object from training, it returns a promise that when resolved will return the training results object.

```javascript
  let net = new brain.NeuralNetwork();
  net
    .trainAsync(data, options)
    .then(res => {
      // do something with my trained network
    })
    .catch(handleError);
```
With multiple networks you can train in parallel like this:

```javascript
  const net = new brain.NeuralNetwork();
  const net2 = new brain.NeuralNetwork();

  const p1 = net.trainAsync(data, options);
  const p2 = net2.trainAsync(data, options);

  Promise
    .all([p1, p2])
    .then(values => {
      const res = values[0];
      const res2 = values[1];
      console.log(`net trained in ${res.iterations} and net2 trained in ${res2.iterations}`);
      // do something super cool with my 2 trained networks
    })
    .catch(handleError);
```

# Methods
### train
The output of `train()` is a hash of information about how the training went:

```javascript
{
  error: 0.0039139985510105032,  // training error
  iterations: 406                // training iterations
}
```

# Failing
If the network failed to train, the error will be above the error threshold. This could happen if the training data is too noisy (most likely), the network does not have enough hidden layers or nodes to handle the complexity of the data, or it has not been trained for enough iterations.

If the training error is still something huge like `0.4` after 20000 iterations, it's a good sign that the network can't make sense of the given data.

# JSON
Serialize or load in the state of a trained network with JSON:

```javascript
const json = net.toJSON();
net.fromJSON(json);
```

You can also get a custom standalone function from a trained network that acts just like `run()`:

```javascript
const run = net.toFunction();
const output = run({ r: 1, g: 0.4, b: 0 });
console.log(run.toString()); // copy and paste! no need to import brain.js
```

# Options
`NeuralNetwork()` takes a hash of options:

```javascript
const net = new brain.NeuralNetwork({
  activation: 'sigmoid', // activation function
  hiddenLayers: [4],
  learningRate: 0.6 // global learning rate, useful when training using streams
});
```

### activation
This parameter lets you specify which activation function your neural network should use. There are currently four supported activation functions, **sigmoid** being the default: 

- [sigmoid](https://www.wikiwand.com/en/Sigmoid_function)
- [relu](https://www.wikiwand.com/en/Rectifier_(neural_networks))
- [leaky-relu](https://www.wikiwand.com/en/Rectifier_(neural_networks))
- [tanh](https://theclevermachine.wordpress.com/tag/tanh-function/)

Here's a table (thanks, Wikipedia!) summarizing a plethora of activation functions — [Activation Function](https://www.wikiwand.com/en/Activation_function)

### hiddenLayers
You can use this to specify the number of hidden layers in the network and the size of each layer. For example, if you want two hidden layers - the first with 3 nodes and the second with 4 nodes, you'd give:

```
hiddenLayers: [3, 4]
```

By default `brain.js` uses one hidden layer with size proportionate to the size of the input array.

# Streams
The network now has a [WriteStream](http://nodejs.org/api/stream.html#stream_class_stream_writable). You can train the network by using `pipe()` to send the training data to the network.


### Example
Refer to [`stream-example.js`](./examples/cli/stream-example.js) for an example on how to train the network with a stream.


### Initialization
To train the network using a stream you must first create the stream by calling `net.createTrainStream()` which takes the following options:

* `floodCallback()` - the callback function to re-populate the stream. This gets called on every training iteration.
* `doneTrainingCallback(info)` - the callback function to execute when the network is done training. The `info` param will contain a hash of information about how the training went:

```javascript
{
  error: 0.0039139985510105032,  // training error
  iterations: 406                // training iterations
}
```

### Transform
Use a [Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform) to coerce the data into the correct format. You might also use a Transform stream to normalize your data on the fly.

# Utilities

### `likely`

```js
const likely = require('brain/likely');
const key = likely(input, net);
```

Likely example see: [simple letter detection](./examples/which-letter-simple.js)

# Neural Network Types
* [`brain.NeuralNetwork`](src/neural-network.js) - [Feedforward Neural Network](https://en.wikipedia.org/wiki/Feedforward_neural_network) with backpropagation
* [`brain.recurrent.RNNTimeStep`](src/recurrent/rnn-time-step.js) - [Time Step Recurrent Neural Network or "RNN"](https://en.wikipedia.org/wiki/Recurrent_neural_network)
* [`brain.recurrent.LSTMTimeStep`](src/recurrent/lstm-time-step.js) - [Time Step Long Short Term Memory Neural Network or "LSTM"](https://en.wikipedia.org/wiki/Long_short-term_memory)
* [`brain.recurrent.GRUTimeStep`](src/recurrent/gru-time-step.js) - [Time Step Gated Recurrent Unit or "GRU"](https://en.wikipedia.org/wiki/Gated_recurrent_unit)
* [`brain.recurrent.RNN`](src/recurrent/rnn.js) - [Recurrent Neural Network or "RNN"](https://en.wikipedia.org/wiki/Recurrent_neural_network)
* [`brain.recurrent.LSTM`](src/recurrent/lstm.js) - [Long Short Term Memory Neural Network or "LSTM"](https://en.wikipedia.org/wiki/Long_short-term_memory)
* [`brain.recurrent.GRU`](src/recurrent/gru.js) - [Gated Recurrent Unit or "GRU"](https://en.wikipedia.org/wiki/Gated_recurrent_unit)

### Why different Neural Network Types?
Different neural nets do different things well. For example:
* A Feedforward Neural Network can classify simple things very well, but it has no memory of previous actions and has infinite variation of results.
* A Time Step Recurrent Neural Network _remembers_, and can predict future values.
* A Recurrent Neural Network _remembers_, and has a finite set of results.

# Get Involved!

### Issues

If you have an issue, either a bug or a feature you think would benefit your project let us know and we will do our best.

Create issues [here](https://github.com/BrainJS/brain.js/issues) and follow the template.

### Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="graphs/contributors"><img src="https://opencollective.com/brainjs/contributors.svg?width=890&button=false" /></a>


### Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/brainjs#backer)]

<a href="https://opencollective.com/brainjs#backers" target="_blank"><img src="https://opencollective.com/brainjs/backers.svg?width=890"></a>


### Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/brainjs#sponsor)]

<a href="https://opencollective.com/brainjs/sponsor/0/website" target="_blank"><img src="https://opencollective.com/brainjs/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/brainjs/sponsor/1/website" target="_blank"><img src="https://opencollective.com/brainjs/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/brainjs/sponsor/2/website" target="_blank"><img src="https://opencollective.com/brainjs/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/brainjs/sponsor/3/website" target="_blank"><img src="https://opencollective.com/brainjs/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/brainjs/sponsor/4/website" target="_blank"><img src="https://opencollective.com/brainjs/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/brainjs/sponsor/5/website" target="_blank"><img src="https://opencollective.com/brainjs/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/brainjs/sponsor/6/website" target="_blank"><img src="https://opencollective.com/brainjs/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/brainjs/sponsor/7/website" target="_blank"><img src="https://opencollective.com/brainjs/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/brainjs/sponsor/8/website" target="_blank"><img src="https://opencollective.com/brainjs/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/brainjs/sponsor/9/website" target="_blank"><img src="https://opencollective.com/brainjs/sponsor/9/avatar.svg"></a>

var _ = require("underscore"),
    lookup = require("./lookup"),
    Writable = require('stream').Writable,
    inherits = require('inherits');

var NeuralNetwork = function(options) {
  options = options || {};
  this.learningRate = options.learningRate || 0.3;
  this.momentum = options.momentum || 0.1;
  this.hiddenSizes = options.hiddenLayers;

  this.binaryThresh = options.binaryThresh || 0.5;
}

NeuralNetwork.prototype = {
  initialize: function(sizes) {
    this.sizes = sizes;
    this.outputLayer = this.sizes.length - 1;

    this.biases = []; // weights for bias nodes
    this.weights = [];
    this.outputs = [];

    // state for training
    this.deltas = [];
    this.changes = []; // for momentum
    this.errors = [];

    for (var layer = 0; layer <= this.outputLayer; layer++) {
      var size = this.sizes[layer];
      this.deltas[layer] = zeros(size);
      this.errors[layer] = zeros(size);
      this.outputs[layer] = zeros(size);

      if (layer > 0) {
        this.biases[layer] = randos(size);
        this.weights[layer] = new Array(size);
        this.changes[layer] = new Array(size);

        for (var node = 0; node < size; node++) {
          var prevSize = this.sizes[layer - 1];
          this.weights[layer][node] = randos(prevSize);
          this.changes[layer][node] = zeros(prevSize);
        }
      }
    }
  },

  run: function(input) {
    if (this.inputLookup) {
      input = lookup.toArray(this.inputLookup, input);
    }

    var output = this.runInput(input);

    if (this.outputLookup) {
      output = lookup.toHash(this.outputLookup, output);
    }
    return output;
  },

  runInput: function(input) {
    this.outputs[0] = input;  // set output state of input layer

    for (var layer = 1; layer <= this.outputLayer; layer++) {
      for (var node = 0; node < this.sizes[layer]; node++) {
        var weights = this.weights[layer][node];

        var sum = this.biases[layer][node];
        for (var k = 0; k < weights.length; k++) {
          sum += weights[k] * input[k];
        }
        this.outputs[layer][node] = 1 / (1 + Math.exp(-sum));
      }
      var output = input = this.outputs[layer];
    }
    return output;
  },

  train: function(data, options) {
    data = this.formatData(data);

    options = options || {};
    var iterations = options.iterations || 20000;
    var errorThresh = options.errorThresh || 0.005;
    var log = options.log || false;
    var logPeriod = options.logPeriod || 10;
    var learningRate = options.learningRate || this.learningRate || 0.3;
    var callback = options.callback;
    var callbackPeriod = options.callbackPeriod || 10;

    var inputSize = data[0].input.length;
    var outputSize = data[0].output.length;

    var hiddenSizes = this.hiddenSizes;
    if (!hiddenSizes) {
      hiddenSizes = [Math.max(3, Math.floor(inputSize / 2))];
    }
    var sizes = _([inputSize, hiddenSizes, outputSize]).flatten();
    this.initialize(sizes);

    var error = 1;
    for (var i = 0; i < iterations && error > errorThresh; i++) {
      var sum = 0;
      for (var j = 0; j < data.length; j++) {
        var err = this.trainPattern(data[j].input, data[j].output, learningRate);
        sum += err;
      }
      error = sum / data.length;

      if (log && (i % logPeriod == 0)) {
        console.log("iterations:", i, "training error:", error);
      }
      if (callback && (i % callbackPeriod == 0)) {
        callback({ error: error, iterations: i });
      }
    }

    return {
      error: error,
      iterations: i
    };
  },

  trainPattern : function(input, target, learningRate) {
    learningRate = learningRate || this.learningRate;

    // forward propogate
    this.runInput(input);

    // back propogate
    this.calculateDeltas(target);
    this.adjustWeights(learningRate);

    var error = mse(this.errors[this.outputLayer]);
    return error;
  },

  calculateDeltas: function(target) {
    for (var layer = this.outputLayer; layer >= 0; layer--) {
      for (var node = 0; node < this.sizes[layer]; node++) {
        var output = this.outputs[layer][node];

        var error = 0;
        if (layer == this.outputLayer) {
          error = target[node] - output;
        }
        else {
          var deltas = this.deltas[layer + 1];
          for (var k = 0; k < deltas.length; k++) {
            error += deltas[k] * this.weights[layer + 1][k][node];
          }
        }
        this.errors[layer][node] = error;
        this.deltas[layer][node] = error * output * (1 - output);
      }
    }
  },

  adjustWeights: function(learningRate) {
    for (var layer = 1; layer <= this.outputLayer; layer++) {
      var incoming = this.outputs[layer - 1];

      for (var node = 0; node < this.sizes[layer]; node++) {
        var delta = this.deltas[layer][node];

        for (var k = 0; k < incoming.length; k++) {
          var change = this.changes[layer][node][k];

          change = (learningRate * delta * incoming[k])
                   + (this.momentum * change);

          this.changes[layer][node][k] = change;
          this.weights[layer][node][k] += change;
        }
        this.biases[layer][node] += learningRate * delta;
      }
    }
  },

  formatData: function(data) {
    if (!_.isArray(data)) { // turn stream datum into array
      var tmp = [];
      tmp.push(data);
      data = tmp;
    }
    // turn sparse hash input into arrays with 0s as filler
    var datum = data[0].input;
    if (!_(datum).isArray() && !(datum instanceof Float64Array)) {
      if (!this.inputLookup) {
        this.inputLookup = lookup.buildLookup(_(data).pluck("input"));
      }
      data = data.map(function(datum) {
        var array = lookup.toArray(this.inputLookup, datum.input)
        return _(_(datum).clone()).extend({ input: array });
      }, this);
    }

    if (!_(data[0].output).isArray()) {
      if (!this.outputLookup) {
        this.outputLookup = lookup.buildLookup(_(data).pluck("output"));
      }
      data = data.map(function(datum) {
        var array = lookup.toArray(this.outputLookup, datum.output);
        return _(_(datum).clone()).extend({ output: array });
      }, this);
    }
    return data;
  },

  test : function(data) {
    data = this.formatData(data);

    // for binary classification problems with one output node
    var isBinary = data[0].output.length == 1;
    var falsePos = 0,
        falseNeg = 0,
        truePos = 0,
        trueNeg = 0;

    // for classification problems
    var misclasses = [];

    // run each pattern through the trained network and collect
    // error and misclassification statistics
    var sum = 0;
    for (var i = 0; i < data.length; i++) {
      var output = this.runInput(data[i].input);
      var target = data[i].output;

      var actual, expected;
      if (isBinary) {
        actual = output[0] > this.binaryThresh ? 1 : 0;
        expected = target[0];
      }
      else {
        actual = output.indexOf(_(output).max());
        expected = target.indexOf(_(target).max());
      }

      if (actual != expected) {
        var misclass = data[i];
        _(misclass).extend({
          actual: actual,
          expected: expected
        })
        misclasses.push(misclass);
      }

      if (isBinary) {
        if (actual == 0 && expected == 0) {
          trueNeg++;
        }
        else if (actual == 1 && expected == 1) {
          truePos++;
        }
        else if (actual == 0 && expected == 1) {
          falseNeg++;
        }
        else if (actual == 1 && expected == 0) {
          falsePos++;
        }
      }

      var errors = output.map(function(value, i) {
        return target[i] - value;
      });
      sum += mse(errors);
    }
    var error = sum / data.length;

    var stats = {
      error: error,
      misclasses: misclasses
    };

    if (isBinary) {
      _(stats).extend({
        trueNeg: trueNeg,
        truePos: truePos,
        falseNeg: falseNeg,
        falsePos: falsePos,
        total: data.length,
        precision: truePos / (truePos + falsePos),
        recall: truePos / (truePos + falseNeg),
        accuracy: (trueNeg + truePos) / data.length
      })
    }
    return stats;
  },

  toJSON: function() {
    /* make json look like:
      {
        layers: [
          { x: {},
            y: {}},
          {'0': {bias: -0.98771313, weights: {x: 0.8374838, y: 1.245858},
           '1': {bias: 3.48192004, weights: {x: 1.7825821, y: -2.67899}}},
          { f: {bias: 0.27205739, weights: {'0': 1.3161821, '1': 2.00436}}}
        ]
      }
    */
    var layers = [];
    for (var layer = 0; layer <= this.outputLayer; layer++) {
      layers[layer] = {};

      var nodes;
      // turn any internal arrays back into hashes for readable json
      if (layer == 0 && this.inputLookup) {
        nodes = _(this.inputLookup).keys();
      }
      else if (layer == this.outputLayer && this.outputLookup) {
        nodes = _(this.outputLookup).keys();
      }
      else {
        nodes = _.range(0, this.sizes[layer]);
      }

      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];
        layers[layer][node] = {};

        if (layer > 0) {
          layers[layer][node].bias = this.biases[layer][j];
          layers[layer][node].weights = {};
          for (var k in layers[layer - 1]) {
            var index = k;
            if (layer == 1 && this.inputLookup) {
              index = this.inputLookup[k];
            }
            layers[layer][node].weights[k] = this.weights[layer][j][index];
          }
        }
      }
    }
    return { layers: layers, outputLookup:!!this.outputLookup, inputLookup:!!this.inputLookup };
  },

  fromJSON: function(json) {
    var size = json.layers.length;
    this.outputLayer = size - 1;

    this.sizes = new Array(size);
    this.weights = new Array(size);
    this.biases = new Array(size);
    this.outputs = new Array(size);

    for (var i = 0; i <= this.outputLayer; i++) {
      var layer = json.layers[i];
      if (i == 0 && (!layer[0] || json.inputLookup)) {
        this.inputLookup = lookup.lookupFromHash(layer);
      }
      else if (i == this.outputLayer && (!layer[0] || json.outputLookup)) {
        this.outputLookup = lookup.lookupFromHash(layer);
      }

      var nodes = _(layer).keys();
      this.sizes[i] = nodes.length;
      this.weights[i] = [];
      this.biases[i] = [];
      this.outputs[i] = [];

      for (var j in nodes) {
        var node = nodes[j];
        this.biases[i][j] = layer[node].bias;
        this.weights[i][j] = _(layer[node].weights).toArray();
      }
    }
    return this;
  },

   toFunction: function() {
    var json = this.toJSON();
    // return standalone function that mimics run()
    return new Function("input",
'  var net = ' + JSON.stringify(json) + ';\n\n\
  for (var i = 1; i < net.layers.length; i++) {\n\
    var layer = net.layers[i];\n\
    var output = {};\n\
    \n\
    for (var id in layer) {\n\
      var node = layer[id];\n\
      var sum = node.bias;\n\
      \n\
      for (var iid in node.weights) {\n\
        sum += node.weights[iid] * input[iid];\n\
      }\n\
      output[id] = (1 / (1 + Math.exp(-sum)));\n\
    }\n\
    input = output;\n\
  }\n\
  return output;');
  },

  // This will create a TrainStream (WriteStream)
  //  for us to send the training data to.
  //  param: opts - the training options
  createTrainStream: function(opts) {
    opts = opts || {};
    opts.neuralNetwork = this;
    this.trainStream = new TrainStream(opts);
    return this.trainStream;
  }
}

function randomWeight() {
  return Math.random() * 0.4 - 0.2;
}

function zeros(size) {
  var array = new Array(size);
  for (var i = 0; i < size; i++) {
    array[i] = 0;
  }
  return array;
}

function randos(size) {
  var array = new Array(size);
  for (var i = 0; i < size; i++) {
    array[i] = randomWeight();
  }
  return array;
}

function mse(errors) {
  // mean squared error
  var sum = 0;
  for (var i = 0; i < errors.length; i++) {
    sum += Math.pow(errors[i], 2);
  }
  return sum / errors.length;
}

exports.NeuralNetwork = NeuralNetwork;

function TrainStream(opts) {
  Writable.call(this, {
    objectMode: true
  });

  opts = opts || {};

  // require the neuralNetwork
  if (!opts.neuralNetwork) {
    throw new Error('no neural network specified');
  }

  this.neuralNetwork = opts.neuralNetwork;
  this.dataFormatDetermined = false;

  this.inputKeys = [];
  this.outputKeys = []; // keeps track of keys seen
  this.i = 0; // keep track of the for loop i variable that we got rid of
  this.iterations = opts.iterations || 20000;
  this.errorThresh = opts.errorThresh || 0.005;
  this.log = opts.log || false;
  this.logPeriod = opts.logPeriod || 10;
  this.callback = opts.callback;
  this.callbackPeriod = opts.callbackPeriod || 10;
  this.floodCallback = opts.floodCallback;
  this.doneTrainingCallback = opts.doneTrainingCallback;

  this.size = 0;
  this.count = 0;

  this.sum = 0;

  this.on('finish', this.finishStreamIteration);

  return this;
}

inherits(TrainStream, Writable);

/*
  _write expects data to be in the form of a datum.
  ie. {input: {a: 1 b: 0}, output: {z: 0}}
 */
TrainStream.prototype._write = function(chunk, enc, next) {
  if (!chunk) { // check for the end of one interation of the stream
    this.emit('finish');
    return next();
  }

  if (!this.dataFormatDetermined) {
    this.size++;
    this.inputKeys = _.union(this.inputKeys, _.keys(chunk.input));
    this.outputKeys = _.union(this.outputKeys, _.keys(chunk.output));
    this.firstDatum = this.firstDatum || chunk;
    return next();
  }

  this.count++;

  var data = this.neuralNetwork.formatData(chunk);
  this.trainDatum(data[0]);

  // tell the Readable Stream that we are ready for more data
  next();
}

TrainStream.prototype.trainDatum = function(datum) {
  var err = this.neuralNetwork.trainPattern(datum.input, datum.output);
  this.sum += err;
}

TrainStream.prototype.finishStreamIteration = function() {
  if (this.dataFormatDetermined && this.size !== this.count) {
    console.log("This iteration's data length was different from the first.");
  }

  if (!this.dataFormatDetermined) {
    // create the lookup
    this.neuralNetwork.inputLookup = lookup.lookupFromArray(this.inputKeys);
    this.neuralNetwork.outputLookup = lookup.lookupFromArray(this.outputKeys);

    var data = this.neuralNetwork.formatData(this.firstDatum);
    var inputSize = data[0].input.length;
    var outputSize = data[0].output.length;

    var hiddenSizes = this.hiddenSizes;
    if (!hiddenSizes) {
      hiddenSizes = [Math.max(3, Math.floor(inputSize / 2))];
    }
    var sizes = _([inputSize, hiddenSizes, outputSize]).flatten();
    this.dataFormatDetermined = true;
    this.neuralNetwork.initialize(sizes);

    if (typeof this.floodCallback === 'function') {
      this.floodCallback();
    }
    return;
  }

  var error = this.sum / this.size;

  if (this.log && (this.i % this.logPeriod == 0)) {
    console.log("iterations:", this.i, "training error:", error);
  }
  if (this.callback && (this.i % this.callbackPeriod == 0)) {
    this.callback({
      error: error,
      iterations: this.i
    });
  }

  this.sum = 0;
  this.count = 0;
  // update the iterations
  this.i++;

  // do a check here to see if we need the stream again
  if (this.i < this.iterations && error > this.errorThresh) {
    if (typeof this.floodCallback === 'function') {
      return this.floodCallback();
    }
  } else {
    // done training
    if (typeof this.doneTrainingCallback === 'function') {
      return this.doneTrainingCallback({
        error: error,
        iterations: this.i
      });
    }
  }
}

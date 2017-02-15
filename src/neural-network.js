import lookup from './lookup';
import TrainStream from './train-stream';
import max from './utilities/max';
import mse from './utilities/mse';
import randos from './utilities/randos';
import range from './utilities/range';
import toArray from './utilities/to-array';
import zeros from './utilities/zeros';

/**
 *
 * @param {object} options
 * @constructor
 */
export default class NeuralNetwork {
  constructor(options = {}) {
    Object.assign(this, NeuralNetwork.defaults, options);
    this.hiddenSizes = options.hiddenLayers;

    this.sizes = null;
    this.outputLayer = null;
    this.biases = null; // weights for bias nodes
    this.weights = null;
    this.outputs = null;

    // state for training
    this.deltas = null;
    this.changes = null; // for momentum
    this.errors = null;
  }

  /**
   *
   * @param {} sizes
   * @param {Boolean} keepNetworkIntact
   */
  initialize(sizes, keepNetworkIntact) {
    this.sizes = sizes;
    this.outputLayer = this.sizes.length - 1;

    if (!keepNetworkIntact) {
      this.biases = []; // weights for bias nodes
      this.weights = [];
      this.outputs = [];
    }

    // state for training
    this.deltas = [];
    this.changes = []; // for momentum
    this.errors = [];

    for (let layer = 0; layer <= this.outputLayer; layer++) {
      let size = this.sizes[layer];
      this.deltas[layer] = zeros(size);
      this.errors[layer] = zeros(size);
      if (!keepNetworkIntact) {
        this.outputs[layer] = zeros(size);
      }

      if (layer > 0) {
        this.biases[layer] = randos(size);
        if (!keepNetworkIntact) {
          this.weights[layer] = new Array(size);
        }
        this.changes[layer] = new Array(size);

        for (let node = 0; node < size; node++) {
          let prevSize = this.sizes[layer - 1];
          if (!keepNetworkIntact) {
            this.weights[layer][node] = randos(prevSize);
          }
          this.changes[layer][node] = zeros(prevSize);
        }
      }
    }
  }

  /**
   *
   * @param input
   * @returns {*}
   */
  run(input) {
    if (this.inputLookup) {
      input = lookup.toArray(this.inputLookup, input);
    }

    let output = this.runInput(input);

    if (this.outputLookup) {
      output = lookup.toHash(this.outputLookup, output);
    }
    return output;
  }

  /**
   *
   * @param input
   * @returns {*}
   */
  runInput(input) {
    this.outputs[0] = input;  // set output state of input layer

    let output = null;
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      for (let node = 0; node < this.sizes[layer]; node++) {
        let weights = this.weights[layer][node];

        let sum = this.biases[layer][node];
        for (let k = 0; k < weights.length; k++) {
          sum += weights[k] * input[k];
        }
        this.outputs[layer][node] = 1 / (1 + Math.exp(-sum));
      }
      output = input = this.outputs[layer];
    }
    return output;
  }

  /**
   *
   * @param data
   * @param options
   * @returns {{error: number, iterations: number}}
   */
  train(data, _options = {}) {
    const options = Object.assign({}, NeuralNetwork.trainDefaults, _options);
    data = this.formatData(data);
    let iterations = options.iterations;
    let errorThresh = options.errorThresh;
    let log = options.log === true ? console.log : options.log;
    let logPeriod = options.logPeriod;
    let learningRate = _options.learningRate || this.learningRate || options.learningRate;
    let callback = options.callback;
    let callbackPeriod = options.callbackPeriod;
    let sizes = [];
    let inputSize = data[0].input.length;
    let outputSize = data[0].output.length;
    let hiddenSizes = this.hiddenSizes;
    if (!hiddenSizes) {
      sizes.push(Math.max(3, Math.floor(inputSize / 2)));
    } else {
      hiddenSizes.forEach(size => {
        sizes.push(size);
      });
    }

    sizes.unshift(inputSize);
    sizes.push(outputSize);

    this.initialize(sizes, options.keepNetworkIntact);

    let error = 1;
    let i;
    for (i = 0; i < iterations && error > errorThresh; i++) {
      let sum = 0;
      for (let j = 0; j < data.length; j++) {
        let err = this.trainPattern(data[j].input, data[j].output, learningRate);
        sum += err;
      }
      error = sum / data.length;

      if (log && (i % logPeriod == 0)) {
        log('iterations:', i, 'training error:', error);
      }
      if (callback && (i % callbackPeriod == 0)) {
        callback({ error: error, iterations: i });
      }
    }

    return {
      error: error,
      iterations: i
    };
  }

  /**
   *
   * @param input
   * @param target
   * @param learningRate
   */
  trainPattern(input, target, learningRate) {
    learningRate = learningRate || this.learningRate;

    // forward propagate
    this.runInput(input);

    // back propagate
    this.calculateDeltas(target);
    this.adjustWeights(learningRate);

    let error = mse(this.errors[this.outputLayer]);
    return error;
  }

  /**
   *
   * @param target
   */
  calculateDeltas(target) {
    for (let layer = this.outputLayer; layer >= 0; layer--) {
      for (let node = 0; node < this.sizes[layer]; node++) {
        let output = this.outputs[layer][node];

        let error = 0;
        if (layer == this.outputLayer) {
          error = target[node] - output;
        }
        else {
          let deltas = this.deltas[layer + 1];
          for (let k = 0; k < deltas.length; k++) {
            error += deltas[k] * this.weights[layer + 1][k][node];
          }
        }
        this.errors[layer][node] = error;
        this.deltas[layer][node] = error * output * (1 - output);
      }
    }
  }

  /**
   *
   * @param learningRate
   */
  adjustWeights(learningRate) {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      let incoming = this.outputs[layer - 1];

      for (let node = 0; node < this.sizes[layer]; node++) {
        let delta = this.deltas[layer][node];

        for (let k = 0; k < incoming.length; k++) {
          let change = this.changes[layer][node][k];

          change = (learningRate * delta * incoming[k])
            + (this.momentum * change);

          this.changes[layer][node][k] = change;
          this.weights[layer][node][k] += change;
        }
        this.biases[layer][node] += learningRate * delta;
      }
    }
  }

  /**
   *
   * @param data
   * @returns {*}
   */
  formatData(data) {
    if (data.constructor !== Array) { // turn stream datum into array
      let tmp = [];
      tmp.push(data);
      data = tmp;
    }
    // turn sparse hash input into arrays with 0s as filler
    let datum = data[0].input;
    if (datum.constructor !== Array && !(datum instanceof Float64Array)) {
      if (!this.inputLookup) {
        this.inputLookup = lookup.buildLookup(data.map(value => value['input']));
      }
      data = data.map(datum => {
        let array = lookup.toArray(this.inputLookup, datum.input);
        return Object.assign({}, datum, { input: array });
      }, this);
    }

    if (data[0].output.constructor !== Array) {
      if (!this.outputLookup) {
        this.outputLookup = lookup.buildLookup(data.map(value => value['output']));
      }
      data = data.map(datum => {
        let array = lookup.toArray(this.outputLookup, datum.output);
        return Object.assign({}, datum, { output: array });
      }, this);
    }
    return data;
  }

  /**
   *
   * @param data
   * @returns {
   *  {
   *    error: number,
   *    misclasses: Array
   *  }
   * }
   */
  test(data) {
    data = this.formatData(data);

    // for binary classification problems with one output node
    let isBinary = data[0].output.length == 1;
    let falsePos = 0;
    let falseNeg = 0;
    let truePos = 0;
    let trueNeg = 0;

    // for classification problems
    let misclasses = [];

    // run each pattern through the trained network and collect
    // error and misclassification statistics
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      let output = this.runInput(data[i].input);
      let target = data[i].output;

      let actual, expected;
      if (isBinary) {
        actual = output[0] > this.binaryThresh ? 1 : 0;
        expected = target[0];
      }
      else {
        actual = output.indexOf(max(output));
        expected = target.indexOf(max(target));
      }

      if (actual != expected) {
        let misclass = data[i];
        Object.assign(misclass, {
          actual: actual,
          expected: expected
        });
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

      let errors = output.map((value, i) => {
        return target[i] - value;
      });
      sum += mse(errors);
    }
    let error = sum / data.length;

    let stats = {
      error: error,
      misclasses: misclasses
    };

    if (isBinary) {
      Object.assign(stats, {
        trueNeg: trueNeg,
        truePos: truePos,
        falseNeg: falseNeg,
        falsePos: falsePos,
        total: data.length,
        precision: truePos / (truePos + falsePos),
        recall: truePos / (truePos + falseNeg),
        accuracy: (trueNeg + truePos) / data.length
      });
    }
    return stats;
  }

  /**
   *
   * @returns
   *  {
   *    layers: [
   *      {
   *        x: {},
   *        y: {}
   *      },
   *      {
   *        '0': {
   *          bias: -0.98771313,
   *          weights: {
   *            x: 0.8374838,
   *            y: 1.245858
   *          },
   *        '1': {
   *          bias: 3.48192004,
   *          weights: {
   *            x: 1.7825821,
   *            y: -2.67899
   *          }
   *        }
   *      },
   *      {
   *        f: {
   *          bias: 0.27205739,
   *          weights: {
   *            '0': 1.3161821,
   *            '1': 2.00436
   *          }
   *        }
   *      }
   *    ]
   *  }
   */
  toJSON() {
    let layers = [];
    for (let layer = 0; layer <= this.outputLayer; layer++) {
      layers[layer] = {};

      let nodes;
      // turn any internal arrays back into hashes for readable json
      if (layer == 0 && this.inputLookup) {
        nodes = Object.keys(this.inputLookup);
      }
      else if (layer == this.outputLayer && this.outputLookup) {
        nodes = Object.keys(this.outputLookup);
      }
      else {
        nodes = range(0, this.sizes[layer]);
      }

      for (let j = 0; j < nodes.length; j++) {
        let node = nodes[j];
        layers[layer][node] = {};

        if (layer > 0) {
          layers[layer][node].bias = this.biases[layer][j];
          layers[layer][node].weights = {};
          for (let k in layers[layer - 1]) {
            let index = k;
            if (layer == 1 && this.inputLookup) {
              index = this.inputLookup[k];
            }
            layers[layer][node].weights[k] = this.weights[layer][j][index];
          }
        }
      }
    }
    return { layers: layers, outputLookup:!!this.outputLookup, inputLookup:!!this.inputLookup };
  }

  /**
   *
   * @param json
   * @returns {NeuralNetwork}
   */
  fromJSON(json) {
    let size = json.layers.length;
    this.outputLayer = size - 1;

    this.sizes = new Array(size);
    this.weights = new Array(size);
    this.biases = new Array(size);
    this.outputs = new Array(size);

    for (let i = 0; i <= this.outputLayer; i++) {
      let layer = json.layers[i];
      if (i == 0 && (!layer[0] || json.inputLookup)) {
        this.inputLookup = lookup.lookupFromHash(layer);
      }
      else if (i == this.outputLayer && (!layer[0] || json.outputLookup)) {
        this.outputLookup = lookup.lookupFromHash(layer);
      }

      let nodes = Object.keys(layer);
      this.sizes[i] = nodes.length;
      this.weights[i] = [];
      this.biases[i] = [];
      this.outputs[i] = [];

      for (let j in nodes) {
        let node = nodes[j];
        this.biases[i][j] = layer[node].bias;
        this.weights[i][j] = toArray(layer[node].weights);
      }
    }
    return this;
  }

  /**
   *
   * @returns {Function}
   */
  toFunction() {
    function nodeHandle(layers, layerNumber, nodeKey) {
      if (layerNumber === 0) {
        return (typeof nodeKey === 'string'
          ? `input['${nodeKey}']`
          : `input[${nodeKey}]`);
      }

      const layer = layers[layerNumber];
      const node = layer[nodeKey];
      let result = [node.bias];
      for (let w in node.weights) {
        if (node.weights[w] < 0) {
          result.push(`${node.weights[w]}*(${nodeHandle(layers, layerNumber - 1, w)})`);
        } else {
          result.push(`+${node.weights[w]}*(${nodeHandle(layers, layerNumber - 1, w)})`);
        }
      }
      return `1/(1+1/Math.exp(${result.join('')}))`;
    }

    const layers = this.toJSON().layers;
    const layersAsMath = [];
    let result;
    for (let i in layers[layers.length - 1]) {
      layersAsMath.push(nodeHandle(layers, layers.length - 1, i));
    }
    if (this.outputLookup) {
      result = `{${
        Object.keys(this.outputLookup)
          .map((key, i) => `'${key}':${layersAsMath[i]}`)
      }}`;
    } else {
      result = `[${layersAsMath.join(',')}]`;
    }
    return new Function('input', `return ${result}`);
  }

  /**
   * This will create a TrainStream (WriteStream) for us to send the training data to.
   * @param opts training options
   * @returns {TrainStream|*}
   */
  createTrainStream(opts) {
    opts = opts || {};
    opts.neuralNetwork = this;
    this.trainStream = new TrainStream(opts);
    return this.trainStream;
  }
}

NeuralNetwork.trainDefaults = {
  iterations: 20000,
  errorThresh: 0.005,
  log: false,
  logPeriod: 10,
  learningRate: 0.3,
  callback: null,
  callbackPeriod: 10,
  keepNetworkIntact: false
};

NeuralNetwork.defaults = {
  learningRate: 0.3,
  momentum: 0.1,
  binaryThresh: 0.5,
  hiddenLayers: null
};
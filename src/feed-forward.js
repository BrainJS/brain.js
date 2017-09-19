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
export default class FeedForward {
  constructor(options = {}) {
    Object.assign(this, FeedForward.defaults, options);
  }

  initialize(layers) {
    this.layers = [];
    for (let i = 0; i < layers.length; i++) {
      this.layers.push(layers[i]());
    }

    for (let i = 1; i < layers.length; i++) {
      this.layers[i].setPreviousLayer(this.layers[i - 1]);
      this.layers[i].setNextLayer(this.layers[i + 1]);
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

  runInput() {
    throw new Error('not yet implemented');
  }

  calculateDeltas() {
    throw new Error('not yet implemented');
  }

  /**
   *
   * @param data
   * @param _options
   * @returns {{error: number, iterations: number}}
   */
  train(data, _options = {}) {
    throw new Error('not yet implemented');

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
   * @param learningRate
   */
  adjustWeights(learningRate) {
    throw new Error('not yet implemented');
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
    let isBinary = data[0].output.length === 1;
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

      if (actual !== expected) {
        let misclass = data[i];
        Object.assign(misclass, {
          actual: actual,
          expected: expected
        });
        misclasses.push(misclass);
      }

      if (isBinary) {
        if (actual === 0 && expected === 0) {
          trueNeg++;
        } else if (actual === 1 && expected === 1) {
          truePos++;
        } else if (actual === 0 && expected === 1) {
          falseNeg++;
        } else if (actual === 1 && expected === 0) {
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
   */
  toJSON() {
    throw new Error('not yet implemented');
  }

  /**
   *
   * @param json
   * @returns {NeuralNetwork}
   */
  fromJSON(json) {
    throw new Error('not yet implemented');
  }

  /**
   *
   * @returns {Function}
   */
  toFunction() {
    throw new Error('not yet implemented');
  }

  /**
   * This will create a TrainStream (WriteStream) for us to send the training data to.
   * @param opts training options
   * @returns {TrainStream|*}
   */
  createTrainStream(opts) {
    throw new Error('not yet implemented');
  }
}

FeedForward.trainDefaults = {
  iterations: 20000,
  errorThresh: 0.005,
  log: false,
  logPeriod: 10,
  learningRate: 0.3,
  callback: null,
  callbackPeriod: 10,
  reinforce: false
};

FeedForward.defaults = {
  learningRate: 0.3,
  momentum: 0.1,
  binaryThresh: 0.5,
  hiddenLayers: null,
  layers: null
};
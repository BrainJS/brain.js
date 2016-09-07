import sampleI from './matrix/sample-i';
import maxI from './matrix/max-i';
import Matrix from './matrix';
import clone from './matrix/clone';
import copy from './matrix/copy';
import RandomMatrix from './matrix/random-matrix';
import softmax from './matrix/softmax';
import Equation from './equation';

const defaults = {
  isBackPropagate: true,
  // hidden size should be a list
  inputSize: 20,
  inputRange: 20,
  hiddenSizes:[20,20],
  outputSize: 20,
  learningRate: 0.01,
  decayRate: 0.999,
  smoothEps: 1e-8,
  regc: 0.000001,
  clipval: 5,
  json: null
};

export default class RNN {
  /**
   *
   * @param json
   * @returns {RNN}
   */
  static createFromJSON(json) {
    return new RNN({ json: json });
  }

  constructor(options) {
    options = options || {};

    for (let p in defaults) {
      if (defaults.hasOwnProperty(p) && p !== 'isBackPropagate') {
        this[p] = options.hasOwnProperty(p) ? options[p] : defaults[p];
      }
    }

    this.stepCache = {};
    this.runs = 0;
    this.logProbabilities = null;
    this.totalPerplexity = null;
    this.totalCost = null;

    this.model = {
      input: [],
      inputRows: [],
      equations: [],
      hidden: [],
      output: null,
      allMatrices: [],
      hiddenLayers: []
    };

    if (this.json) {
      this.fromJSON(this.json);
    } else {
      this.createModel();
      this.mapModel();
    }
  }

  createModel() {
    let hiddenSizes = this.hiddenSizes;
    let model = this.model;
    let hiddenLayers = model.hiddenLayers;
    //0 is end, so add 1 to offset
    hiddenLayers.push(this.getModel(hiddenSizes[0], this.inputSize));
    let prevSize = hiddenSizes[0];

    for(let d = 1; d < hiddenSizes.length; d++) { // loop over depths
      let hiddenSize = hiddenSizes[d];
      hiddenLayers.push(this.getModel(hiddenSize, prevSize));
      prevSize = hiddenSize;
    }
  }

  getModel(hiddenSize, prevSize) {
    return {
      //wxh
      weight: new RandomMatrix(hiddenSize, prevSize, 0.08),
      //whh
      transition: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      //bhh
      bias: new Matrix(hiddenSize, 1)
    };
  }

  /**
   *
   * @param {Equation} equation
   * @param {Matrix} inputMatrix
   * @param {Number} size
   * @param {Object} hiddenLayer
   * @returns {Matrix}
   */
  getEquation(equation, inputMatrix, size, hiddenLayer) {
    let relu = equation.relu.bind(equation);
    let add = equation.add.bind(equation);
    let multiply = equation.multiply.bind(equation);
    let previousResult = equation.previousResult.bind(equation);

    return relu(
      add(
        add(
          multiply(
            hiddenLayer.weight,
            inputMatrix
          ),
          multiply(
            hiddenLayer.transition,
            previousResult(size)
          )
        ),
        hiddenLayer.bias
      )
    );
  }

  createInputMatrix() {
    //0 is end, so add 1 to offset
    this.model.input = new RandomMatrix(this.inputRange + 1, this.inputSize, 0.08);
  }

  createOutputMatrix() {
    let model = this.model;
    let outputSize = this.outputSize;
    let lastHiddenSize = this.hiddenSizes[this.hiddenSizes.length - 1];

    //0 is end, so add 1 to offset
    //whd
    model.outputConnector = new RandomMatrix(outputSize + 1, lastHiddenSize, 0.08);
    //0 is end, so add 1 to offset
    //bd
    model.output = new Matrix(outputSize + 1, 1);
  }

  bindEquations() {
    let model = this.model;
    let hiddenSizes = this.hiddenSizes;
    let hiddenLayers = model.hiddenLayers;

    let equation = new Equation();
    model.equations.push(equation);
    // 0 index
    let output = this.getEquation(equation, equation.inputMatrixToRow(model.input), hiddenSizes[0], hiddenLayers[0]);
    equation.addPreviousResult(output);
    // 1+ indexes
    for (let i = 1, max = hiddenSizes.length; i < max; i++) {
      output = this.getEquation(equation, output, hiddenSizes[i], hiddenLayers[i]);
      equation.addPreviousResult(output);
    }
    equation.add(equation.multiply(model.outputConnector, output), model.output);
  }

  mapModel() {
    let model = this.model;
    let hiddenLayers = model.hiddenLayers;
    let allMatrices = model.allMatrices;

    this.createInputMatrix();
    if (!model.input) throw new Error('net.model.input not set');

    this.createOutputMatrix();
    if (!model.outputConnector) throw new Error('net.model.outputConnector not set');
    if (!model.output) throw new Error('net.model.output not set');

    this.bindEquations();
    if (!model.equations.length > 0) throw new Error('net.equations not set');

    allMatrices.push(model.input);

    for(let i = 0, max = hiddenLayers.length; i < max; i++) {
      let hiddenMatrix = hiddenLayers[i];
      for (let property in hiddenMatrix) {
        if (!hiddenMatrix.hasOwnProperty(property)) continue;
        allMatrices.push(hiddenMatrix[property]);
      }
    }

    allMatrices.push(model.outputConnector);
    allMatrices.push(model.output);
  }

  run(input) {
    this.runs++;
    input = input || this.model.input;
    let equations = this.model.equations;
    let max = input.length;
    let log2ppl = 0;
    let cost = 0;

    for (let equationIndex = 0, equationMax = equations.length; equationIndex < equationMax; equationIndex++) {
      equations[equationIndex].resetPreviousResults();
    }

    while (equations.length <= max) {
      this.bindEquations();
    }

    let i;
    let output;
    for (i = -1; i < max; i++) {
      // start and end tokens are zeros
      let equation = equations[i + 1];
      let ixSource = (i === -1 ? 0 : input[i]); // first step: start with START token
      let ixTarget = (i === max - 1 ? 0 : input[i + 1]); // last step: end with END token
      output = equation.run(ixSource);
      if (equations[i + 2]) {
        equation.copyPreviousResultsTo(equations[i + 2]);
      }

      // set gradients into log probabilities
      this.logProbabilities = output; // interpret output as log probabilities
      let probabilities = softmax(output); // compute the softmax probabilities

      log2ppl += -Math.log2(probabilities.weights[ixTarget]); // accumulate base 2 log prob and do smoothing
      cost += -Math.log(probabilities.weights[ixTarget]);

      // write gradients into log probabilities
      this.logProbabilities.recurrence = probabilities.weights.slice(0);
      this.logProbabilities.recurrence[ixTarget] -= 1
    }

    while (i > -1) {
      equations[i--].runBackpropagate();
    }

    this.step();

    this.totalPerplexity = Math.pow(2, log2ppl / (max - 1));
    this.totalCost = cost;
    return output;
  }

  step() {
    // perform parameter update
    let stepSize = this.learningRate;
    let regc = this.regc;
    let clipval = this.clipval;
    let model = this.model;
    let numClipped = 0;
    let numTot = 0;
    let allMatrices = model.allMatrices;
    let matrixIndexes = allMatrices.length;
    for(let matrixIndex = 0; matrixIndex < matrixIndexes; matrixIndex++) {
      let matrix = allMatrices[matrixIndex];
      if (!(matrixIndex in this.stepCache)) {
        this.stepCache[matrixIndex] = new Matrix(matrix.rows, matrix.columns);
      }
      let cache = this.stepCache[matrixIndex];

      for(let i = 0, n = matrix.weights.length; i < n; i++) {
        // rmsprop adaptive learning rate
        let mdwi = matrix.recurrence[i];
        cache.weights[i] = cache.weights[i] * this.decayRate + (1 - this.decayRate) * mdwi * mdwi;
        // gradient clip
        if (mdwi > clipval) {
          mdwi = clipval;
          numClipped++;
        }
        if (mdwi < -clipval) {
          mdwi = -clipval;
          numClipped++;
        }
        numTot++;

        // update (and regularize)
        matrix.weights[i] += -stepSize * mdwi / Math.sqrt(cache.weights[i] + this.smoothEps) - regc * matrix.weights[i];
        matrix.recurrence[i] = 0; // reset gradients for next iteration
      }
    }
    this.ratioClipped = numClipped / numTot;
  }

  predict(_sampleI, temperature, predictionLength) {
    if (typeof _sampleI === 'undefined') { _sampleI = true; }
    if (typeof temperature === 'undefined') { temperature = 1; }
    if (typeof predictionLength === 'undefined') { predictionLength = 100; }

    let result = [];
    //var prev;
    let ix;
    let equation = this.model.equations[0];
    equation.resetPreviousResults();
    while (true) {
      ix = result.length === 0 ? 0 : result[result.length - 1];
      let lh = equation.run(ix);
      equation.updatePreviousResults();
      //prev = clone(lh);
      // sample predicted letter
      this.logProbabilities = lh;
      if (temperature !== 1 && _sampleI) {
        // scale log probabilities by temperature and renormalize
        // if temperature is high, logprobs will go towards zero
        // and the softmax outputs will be more diffuse. if temperature is
        // very low, the softmax outputs will be more peaky
        for (let q = 0, nq = this.logProbabilities.weights.length; q < nq; q++) {
          this.logProbabilities.weights[q] /= temperature;
        }
      }

      let probs = softmax(this.logProbabilities);

      if (_sampleI) {
        ix = sampleI(probs);
      } else {
        ix = maxI(probs);
      }

      if (ix === 0) {
        // END token predicted, break out
        break;
      }
      if (result.length > predictionLength) {
        // something is wrong
        break;
      }

      result.push(ix);
    }

    return result;
  }

  /**
   *
   * @param input
   * @returns {*}
   */
  runInput(input) {
    throw new Error('not yet implemented');
  }

  /**
   *
   * @param data
   * @param options
   * @returns {{error: number, iterations: number}}
   */
  train(data, options) {
    //data = this.formatData(data);

    options = options || {};
    let iterations = options.iterations || 20000;
    let errorThresh = options.errorThresh || 0.005;
    let log = options.log ? (typeof options.log === 'function' ? options.log : console.log) : false;
    let logPeriod = options.logPeriod || 10;
    let learningRate = options.learningRate || this.learningRate || 0.3;
    let callback = options.callback;
    let callbackPeriod = options.callbackPeriod || 10;
    let sizes = [];
    let inputSize = data[0].input.length;
    let outputSize = data[0].output.length;
    let hiddenSizes = this.hiddenSizes;
    if (!hiddenSizes) {
      sizes.push(Math.max(3, Math.floor(inputSize / 2)));
    } else {
      hiddenSizes.forEach(function(size) {
        sizes.push(size);
      });
    }

    sizes.unshift(inputSize);
    sizes.push(outputSize);

    this.initialize(sizes, options.keepNetworkIntact);

    let error = 1;
    for (let i = 0; i < iterations && error > errorThresh; i++) {
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
    throw new Error('not yet implemented');
  }

  /**
   *
   * @param target
   */
  calculateDeltas(target) {
    throw new Error('not yet implemented');
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
    throw new Error('not yet implemented');
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
    throw new Error('not yet implemented');
  }

  toJSON() {
    let model = this.model;
    return {
      type: this.constructor.name,
      input: model.input.toJSON(),
      hiddenLayers: model.hiddenLayers.map(function(hiddenLayer) {
        let layers = {};
        for (let p in hiddenLayer) {
          layers[p] = hiddenLayer[p].toJSON();
        }
        return layers;
      }),
      outputConnector: this.model.outputConnector.toJSON(),
      output: this.model.output.toJSON()
    };
  }

  fromJSON(json) {
    this.json = json;
    let model = this.model;
    let allMatrices = model.allMatrices;
    model.input = Matrix.fromJSON(json.input);
    allMatrices.push(model.input);
    model.hiddenLayers = json.hiddenLayers.map(function(hiddenLayer) {
      let layers = {};
      for (let p in hiddenLayer) {
        layers[p] = Matrix.fromJSON(hiddenLayer[p]);
        allMatrices.push(layers[p]);
      }
      return layers;
    });
    model.outputConnector = Matrix.fromJSON(json.outputConnector);
    model.output = Matrix.fromJSON(json.output);
    allMatrices.push(model.outputConnector, model.output);
    this.bindEquations();
  }

  /**
   *
   * @returns {Function}
   */
  toFunction() {
    throw new Error('not yet implemented');
  }
}

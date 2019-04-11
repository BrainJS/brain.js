import BaseInterface from '../base-interface';
import Matrix from './matrix';
import RandomMatrix from './matrix/random-matrix';
import Equation from './matrix/equation';
import sampleI from './matrix/sample-i';
import maxI from './matrix/max-i';
import softmax from './matrix/softmax';
import copy from './matrix/copy';
import { randomF } from '../utilities/random';
import zeros from '../utilities/zeros';
import DataFormatter from '../utilities/data-formatter';
export default class RNN extends BaseInterface {
  constructor(options) {
    super(options);

    this.stepCache = {};
    this.runs = 0;
    this.ratioClipped = null;
    this.model = null;

    if (options.json) {
      this.fromJSON(options.json);
    }
  }

  initialize() {
    this.model = {
      input: null,
      hiddenLayers: [],
      output: null,
      equations: [],
      allMatrices: [],
      equationConnections: [],
      outputConnector: null,
    };

    if (this.dataFormatter) {
      this.inputSize =
      this.inputRange =
      this.outputSize = this.dataFormatter.characters.length;
    }
    this.mapModel();
  }

  createHiddenLayers() {
    //0 is end, so add 1 to offset
    this.model.hiddenLayers.push(this.getModel(this.hiddenLayers[0], this.inputSize));
    let prevSize = this.hiddenLayers[0];

    for (let d = 1; d < this.hiddenLayers.length; d++) { // loop over depths
      let hiddenSize = this.hiddenLayers[d];
      this.model.hiddenLayers.push(this.getModel(hiddenSize, prevSize));
      prevSize = hiddenSize;
    }
  }

  /**
   *
   * @param {Number} hiddenSize
   * @param {Number} prevSize
   * @returns {object}
   */
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
   * @param {Matrix} previousResult
   * @param {Object} hiddenLayer
   * @returns {Matrix}
   */
  getEquation(equation, inputMatrix, previousResult, hiddenLayer) {
    let relu = equation.relu.bind(equation);
    let add = equation.add.bind(equation);
    let multiply = equation.multiply.bind(equation);

    return relu(
      add(
        add(
          multiply(
            hiddenLayer.weight,
            inputMatrix
          ),
          multiply(
            hiddenLayer.transition,
            previousResult
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
    let lastHiddenSize = this.hiddenLayers[this.hiddenLayers.length - 1];

    //0 is end, so add 1 to offset
    //whd
    model.outputConnector = new RandomMatrix(outputSize + 1, lastHiddenSize, 0.08);
    //0 is end, so add 1 to offset
    //bd
    model.output = new Matrix(outputSize + 1, 1);
  }

  bindEquation() {
    const model = this.model;
    const equation = new Equation();
    const outputs = [];
    const equationConnection = model.equationConnections.length > 0
      ? model.equationConnections[model.equationConnections.length - 1]
      : this.initialLayerInputs
      ;

      // 0 index
    let output = this.getEquation(equation, equation.inputMatrixToRow(model.input), equationConnection[0], model.hiddenLayers[0]);
    outputs.push(output);
    // 1+ indices
    for (let i = 1, max = this.hiddenLayers.length; i < max; i++) {
      output = this.getEquation(equation, output, equationConnection[i], model.hiddenLayers[i]);
      outputs.push(output);
    }

    model.equationConnections.push(outputs);
    equation.add(equation.multiply(model.outputConnector, output), model.output);
    model.equations.push(equation);
  }

  mapModel() {
    const model = this.model;
    const hiddenLayers = model.hiddenLayers;
    const allMatrices = model.allMatrices;
    this.initialLayerInputs = this.hiddenLayers.map((size) => new Matrix(size, 1));

    this.createInputMatrix();
    if (!model.input) throw new Error('net.model.input not set');
    allMatrices.push(model.input);

    this.createHiddenLayers();
    if (!model.hiddenLayers.length) throw new Error('net.hiddenLayers not set');
    for (let i = 0, max = hiddenLayers.length; i < max; i++) {
      let hiddenMatrix = hiddenLayers[i];
      for (let property in hiddenMatrix) {
        if (!hiddenMatrix.hasOwnProperty(property)) continue;
        allMatrices.push(hiddenMatrix[property]);
      }
    }

    this.createOutputMatrix();
    if (!model.outputConnector) throw new Error('net.model.outputConnector not set');
    if (!model.output) throw new Error('net.model.output not set');

    allMatrices.push(model.outputConnector);
    allMatrices.push(model.output);
  }

  /**
   *
   * @param {Number[]|string[]|string} input
   * @param {boolean} [logErrorRate]
   * @returns {number}
   */
  trainPattern(input, logErrorRate) {
    const error = this.trainInput(input);
    this.backpropagate(input);
    this.adjustWeights();

    if (logErrorRate) {
      return error;
    }
  }

  /**
   *
   * @param {Number[]} input
   * @returns {number}
   */
  trainInput(input) {
    this.runs++;
    let model = this.model;
    let max = input.length;
    let log2ppl = 0;
    let equation;
    while (model.equations.length <= input.length + 1) {//last is zero
      this.bindEquation();
    }
    for (let inputIndex = -1, inputMax = input.length; inputIndex < inputMax; inputIndex++) {
      // start and end tokens are zeros
      let equationIndex = inputIndex + 1;
      equation = model.equations[equationIndex];

      let source = (inputIndex === -1 ? 0 : input[inputIndex] + 1); // first step: start with START token
      let target = (inputIndex === max - 1 ? 0 : input[inputIndex + 1] + 1); // last step: end with END token
      log2ppl += equation.predictTargetIndex(source, target);
    }
    return Math.pow(2, log2ppl / (max - 1)) / 100;
  }

  /**
   * @param {Number[]} input
   */
  backpropagate(input) {
    let i = input.length;
    let model = this.model;
    let equations = model.equations;
    while(i > 0) {
      equations[i].backpropagateIndex(input[i - 1] + 1);
      i--;
    }
    equations[0].backpropagateIndex(0);
  }

  adjustWeights() {
    const { regc, clipval, model, decayRate, stepCache, smoothEps, trainOpts } = this;
    const { learningRate } = trainOpts;
    const { allMatrices } = model;
    let numClipped = 0;
    let numTot = 0;
    for (let matrixIndex = 0; matrixIndex < allMatrices.length; matrixIndex++) {
      const matrix = allMatrices[matrixIndex];
      const { weights, deltas }  = matrix;
      if (!(matrixIndex in stepCache)) {
        stepCache[matrixIndex] = zeros(matrix.rows * matrix.columns);
      }
      const cache = stepCache[matrixIndex];
      for (let i = 0; i < weights.length; i++) {
        let r = deltas[i];
        let w = weights[i];
        // rmsprop adaptive learning rate
        cache[i] = cache[i] * decayRate + (1 - decayRate) * r * r;
        // gradient clip
        if (r > clipval) {
          r = clipval;
          numClipped++;
        }
        if (r < -clipval) {
          r = -clipval;
          numClipped++;
        }
        numTot++;
        // update (and regularize)
        weights[i] = w + -learningRate * r / Math.sqrt(cache[i] + smoothEps) - regc * w;
      }
    }
    this.ratioClipped = numClipped / numTot;
  }


  /**
   *
   * @returns boolean
   */
  get isRunnable(){
    if (this.model.equations.length === 0) {
      console.error(`No equations bound, did you run train()?`);
      return false;
    }

    return true;
  }


  /**
   *
   * @param {Number[]|*} [rawInput]
   * @param {Boolean} [isSampleI]
   * @param {Number} temperature
   * @returns {*}
   */
  run(rawInput = [], isSampleI = false, temperature = 1) {
    const maxPredictionLength = this.maxPredictionLength + rawInput.length + (this.dataFormatter ? this.dataFormatter.specialIndexes.length : 0);
    if (!this.isRunnable) return null;
    const input = this.formatDataIn(rawInput);
    const model = this.model;
    const output = [];
    let i = 0;
    while (true) {
      let previousIndex = (i === 0
        ? 0
        : i < input.length
          ? input[i - 1] + 1
          : output[i - 1])
          ;
      while (model.equations.length <= i) {
        this.bindEquation();
      }
      let equation = model.equations[i];
      // sample predicted letter
      let outputMatrix = equation.runIndex(previousIndex);
      let logProbabilities = new Matrix(model.output.rows, model.output.columns);
      copy(logProbabilities, outputMatrix);
      if (temperature !== 1 && isSampleI) {
        /**
         * scale log probabilities by temperature and re-normalize
         * if temperature is high, logProbabilities will go towards zero
         * and the softmax outputs will be more diffuse. if temperature is
         * very low, the softmax outputs will be more peaky
         */
        for (let j = 0, max = logProbabilities.weights.length; j < max; j++) {
          logProbabilities.weights[j] /= temperature;
        }
      }

      let probs = softmax(logProbabilities);
      let nextIndex = (isSampleI ? sampleI(probs) : maxI(probs));

      i++;
      if (nextIndex === 0) {
        // END token predicted, break out
        break;
      }
      if (i >= maxPredictionLength) {
        // something is wrong
        break;
      }

      output.push(nextIndex);
    }

    /**
     * we slice the input length here, not because output contains it, but it will be erroneous as we are sending the
     * network what is contained in input, so the data is essentially guessed by the network what could be next, till it
     * locks in on a value.
     * Kind of like this, values are from input:
     * 0 -> 4 (or in English: "beginning on input" -> "I have no idea? I'll guess what they want next!")
     * 2 -> 2 (oh how interesting, I've narrowed down values...)
     * 1 -> 9 (oh how interesting, I've now know what the values are...)
     * then the output looks like: [4, 2, 9,...]
     * so we then remove the erroneous data to get our true output
     */
    return this.formatDataOut(
      input,
      output
        .slice(input.length)
        .map(value => value - 1)
    );
  }

  /**
   *
   * @param data
   * Verifies network sizes are initilaized
   * If they are not it will initialize them based off the data set.
   */
  verifyIsInitialized(data) {
    if (!this.model) {
      this.initialize();
    }
  }

  /**
   *
   * @returns {Object}
   */
  toJSON() {
    const defaults = this.constructor.defaults;
    if (!this.model) {
      this.initialize();
    }
    let model = this.model;
    let options = {};
    for (let p in defaults) {
      if (defaults.hasOwnProperty(p)) {
        options[p] = this[p];
      }
    }

    return {
      type: this.constructor.name,
      options: options,
      input: model.input.toJSON(),
      hiddenLayers: model.hiddenLayers.map((hiddenLayer) => {
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
    const defaults = this.constructor.defaults;
    const options = json.options;
    this.model = null;
    this.hiddenLayers = null;
    const allMatrices = [];
    const input = Matrix.fromJSON(json.input);
    allMatrices.push(input);
    const hiddenLayers = [];

    // backward compatibility for hiddenSizes
    (json.hiddenLayers || json.hiddenSizes).forEach((hiddenLayer) => {
      let layers = {};
      for (let p in hiddenLayer) {
        layers[p] = Matrix.fromJSON(hiddenLayer[p]);
        allMatrices.push(layers[p]);
      }
      hiddenLayers.push(layers);
    });

    const outputConnector = Matrix.fromJSON(json.outputConnector);
    allMatrices.push(outputConnector);
    const output = Matrix.fromJSON(json.output);
    allMatrices.push(output);

    Object.assign(this, defaults, options);

    // backward compatibility
    if (options.hiddenSizes) {
      this.hiddenLayers = options.hiddenSizes;
    }

    if (options.dataFormatter) {
      this.dataFormatter = DataFormatter.fromJSON(options.dataFormatter);
    }

    this.model = {
      input,
      hiddenLayers,
      output,
      allMatrices,
      outputConnector,
      equations: [],
      equationConnections: [],
    };
    this.initialLayerInputs = this.hiddenLayers.map((size) => new Matrix(size, 1));
    this.bindEquation();
  }

  /**
   *
   * @returns {Function}
   */
  toFunction() {
    let model = this.model;
    let equations = this.model.equations;
    let equation = equations[1];
    let states = equation.states;
    let jsonString = JSON.stringify(this.toJSON());

    function matrixOrigin(m, stateIndex) {
      for (let i = 0, max = states.length; i < max; i++) {
        let state = states[i];

        if (i === stateIndex) {
          let j = previousConnectionIndex(m);
          switch (m) {
            case state.left:
              if (j > -1) {
                return `typeof prevStates[${ j }] === 'object' ? prevStates[${ j }].product : new Matrix(${ m.rows }, ${ m.columns })`;
              }
            case state.right:
              if (j > -1) {
                return `typeof prevStates[${ j }] === 'object' ? prevStates[${ j }].product : new Matrix(${ m.rows }, ${ m.columns })`;
              }
            case state.product:
              return `new Matrix(${ m.rows }, ${ m.columns })`;
            default:
              throw Error('unknown state');
          }
        }

        if (m === state.product) return `states[${ i }].product`;
        if (m === state.right) return `states[${ i }].right`;
        if (m === state.left) return `states[${ i }].left`;
      }
    }

    function previousConnectionIndex(m) {
      const connection = model.equationConnections[0];
      const states = equations[0].states;
      for (let i = 0, max = states.length; i < max; i++) {
        if (states[i].product === m) {
          return i;
        }
      }
      return connection.indexOf(m);
    }

    function matrixToString(m, stateIndex) {
      if (!m || !m.rows || !m.columns) return 'null';

      if (m === model.input) return `json.input`;
      if (m === model.outputConnector) return `json.outputConnector`;
      if (m === model.output) return `json.output`;

      for (let i = 0, max = model.hiddenLayers.length; i < max; i++) {
        let hiddenLayer = model.hiddenLayers[i];
        for (let p in hiddenLayer) {
          if (!hiddenLayer.hasOwnProperty(p)) continue;
          if (hiddenLayer[p] !== m) continue;
          return `json.hiddenLayers[${ i }].${ p }`;
        }
      }

      return matrixOrigin(m, stateIndex);
    }

    function toInner(fnString) {
      // crude, but should be sufficient for now
      // function() { body }
      fnString = fnString.toString().split('{');
      fnString.shift();
      // body }
      fnString = fnString.join('{');
      fnString = fnString.split('}');
      fnString.pop();
      // body
      return fnString.join('}').split('\n').join('\n        ')
        .replace('product.deltas[i] = 0;', '')
        .replace('product.deltas[column] = 0;', '')
        .replace('left.deltas[leftIndex] = 0;', '')
        .replace('right.deltas[rightIndex] = 0;', '')
        .replace('product.deltas = left.deltas.slice(0);', '');
    }

    function fileName(fnName) {
      return `src/recurrent/matrix/${ fnName.replace(/[A-Z]/g, function(value) { return '-' + value.toLowerCase(); }) }.js`;
    }

    let statesRaw = [];
    let usedFunctionNames = {};
    let innerFunctionsSwitch = [];
    for (let i = 0, max = states.length; i < max; i++) {
      let state = states[i];
      statesRaw.push(`states[${ i }] = {
      name: '${ state.forwardFn.name }',
      left: ${ matrixToString(state.left, i) },
      right: ${ matrixToString(state.right, i) },
      product: ${ matrixToString(state.product, i) }
    }`);

      let fnName = state.forwardFn.name;
      if (!usedFunctionNames[fnName]) {
        usedFunctionNames[fnName] = true;
        innerFunctionsSwitch.push(
          `        case '${ fnName }': //compiled from ${ fileName(fnName) }
          ${ toInner(state.forwardFn.toString()) }
          break;`
        );
      }
    }

    const src = `
  if (typeof rawInput === 'undefined') rawInput = [];
  if (typeof isSampleI === 'undefined') isSampleI = false;
  if (typeof temperature === 'undefined') temperature = 1;
  ${ this.dataFormatter ? this.dataFormatter.toFunctionString() : '' }
  
  var input = ${
      (this.dataFormatter && typeof this.formatDataIn === 'function')
        ? 'formatDataIn(rawInput)' 
        : 'rawInput'
    };
  var json = ${ jsonString };
  var maxPredictionLength = input.length + ${ this.maxPredictionLength };
  var _i = 0;
  var output = [];
  var states = [];
  var prevStates;
  while (true) {
    var previousIndex = (_i === 0
        ? 0
        : _i < input.length
          ? input[_i - 1] + 1
          : output[_i - 1])
          ;
    var rowPluckIndex = previousIndex;
    var state;
    prevStates = states;
    states = [];
    ${ statesRaw.join(';\n    ') };
    for (var stateIndex = 0, stateMax = ${ statesRaw.length }; stateIndex < stateMax; stateIndex++) {
      state = states[stateIndex];
      var product = state.product;
      var left = state.left;
      var right = state.right;
      
      switch (state.name) {
${ innerFunctionsSwitch.join('\n') }
      }
    }
    
    var logProbabilities = state.product;
    if (temperature !== 1 && isSampleI) {
      for (var q = 0, nq = logProbabilities.weights.length; q < nq; q++) {
        logProbabilities.weights[q] /= temperature;
      }
    }

    var probs = softmax(logProbabilities);
    var nextIndex = isSampleI ? sampleI(probs) : maxI(probs);
    
    _i++;
    if (nextIndex === 0) {
      break;
    }
    if (_i >= maxPredictionLength) {
      break;
    }

    output.push(nextIndex);
  }
  ${ (this.dataFormatter && typeof this.formatDataOut === 'function') 
      ? 'return formatDataOut(input, output.slice(input.length).map(function(value) { return value - 1; }))'
      : 'return output.slice(input.length).map(function(value) { return value - 1; })' };
  function Matrix(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.weights = zeros(rows * columns);
  }
  ${ this.dataFormatter && typeof this.formatDataIn === 'function'
      ? `function formatDataIn(input, output) { ${
          toInner(this.formatDataIn.toString())
            .replace(/this[.]dataFormatter[\n\s]+[.]/g, '')
            .replace(/this[.]dataFormatter[.]/g, '')
            .replace(/this[.]dataFormatter/g, 'true')
        } }`
      : '' }
  ${ this.dataFormatter !== null && typeof this.formatDataOut === 'function'
        ? `function formatDataOut(input, output) { ${
            toInner(this.formatDataOut.toString())
              .replace(/this[.]dataFormatter[\n\s]+[.]/g, '')
              .replace(/this[.]dataFormatter[.]/g, '')
              .replace(/this[.]dataFormatter/g, 'true')
          } }` 
        : '' }
  ${ zeros.toString() }
  ${ softmax.toString().replace('_2.default', 'Matrix') }
  ${ randomF.toString() }
  ${ sampleI.toString() }
  ${ maxI.toString() }`;
    return new Function('rawInput', 'isSampleI', 'temperature', src);
  }
}

RNN.defaults = {
  inputSize: 20,
  inputRange: 20,
  hiddenLayers: [20,20],
  outputSize: 20,
  decayRate: 0.999,
  smoothEps: 1e-8,
  regc: 0.000001,
  clipval: 5,
  maxPredictionLength: 100,
  /**
   *
   * @param {*[]} data
   * @returns {Number[]}
   */
  setupData: function(data) {
    if (
      typeof data[0] !== 'string'
      && !Array.isArray(data[0])
      && (
        !data[0].hasOwnProperty('input')
        || !data[0].hasOwnProperty('output')
      )
    ) {
      return data;
    }
    let values = [];
    const result = [];
    if (typeof data[0] === 'string' || Array.isArray(data[0])) {
      if (!this.dataFormatter) {
        for (let i = 0; i < data.length; i++) {
          values.push(data[i]);
        }
        this.dataFormatter = new DataFormatter(values);
      }
      for (let i = 0, max = data.length; i < max; i++) {
        result.push(this.formatDataIn(data[i]));
      }
    } else {
      if (!this.dataFormatter) {
        for (let i = 0; i < data.length; i++) {
          values.push(data[i].input);
          values.push(data[i].output);
        }
        this.dataFormatter = DataFormatter.fromArrayInputOutput(values);
        this.dataFormatter.addUnrecognized();
      }
      for (let i = 0, max = data.length; i < max; i++) {
        result.push(this.formatDataIn(data[i].input, data[i].output));
      }
    }
    return result;
  },
  /**
   *
   * @param {*[]} input
   * @param {*[]} output
   * @returns {Number[]}
   */
  formatDataIn: function(input, output = null) {
    if (this.dataFormatter) {
      if (this.dataFormatter.indexTable.hasOwnProperty('stop-input')) {
        return this.dataFormatter.toIndexesInputOutput(input, output);
      } else {
        return this.dataFormatter.toIndexes(input);
      }
    }
    return input;
  },
  /**
   *
   * @param {Number[]} input
   * @param {Number[]} output
   * @returns {*}
   */
  formatDataOut: function(input, output) {
    if (this.dataFormatter) {
      return this.dataFormatter
        .toCharacters(output)
        .join('');
    }
    return output;
  },
  dataFormatter: null
};

RNN.trainDefaults = {
  iterations: 20000,
  errorThresh: 0.005,
  log: false,
  logPeriod: 10,
  learningRate: 0.01,
  callback: null,
  callbackPeriod: 10
};

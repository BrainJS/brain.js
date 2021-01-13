import { Log } from '../feed-forward';
import { INeuralNetworkTrainOptions, NeuralNetwork } from '../neural-network';
import { INeuralNetworkState } from '../neural-network-types';
import {
  DataFormatter,
  IDataFormatter,
  IDataFormatterJSON,
} from '../utilities/data-formatter';
import { randomFloat } from '../utilities/random';
import { zeros } from '../utilities/zeros';
import { IMatrixJSON, Matrix } from './matrix';
import { copy } from './matrix/copy';
import { Equation } from './matrix/equation';
import { maxI } from './matrix/max-i';
import { RandomMatrix } from './matrix/random-matrix';
import { sampleI } from './matrix/sample-i';
import { softmax } from './matrix/softmax';
import { IRNNDatum, Value } from './rnn-data-types';

export interface IRNNModel {
  isInitialized: boolean;
  input: Matrix;
  hiddenLayers: IRNNHiddenLayerModel[];
  output: Matrix;
  equations: Equation[];
  allMatrices: Matrix[];
  equationConnections: Matrix[][];
  outputConnector: RandomMatrix | Matrix;
}

export interface IRNNOptions {
  inputSize: number;
  inputRange: number;
  hiddenLayers: number[];
  outputSize: number;
  decayRate: number;
  smoothEps: number;
  regc: number;
  clipval: number;
  maxPredictionLength: number;
  dataFormatter: IDataFormatter;
  json?: IRNNJSON;
}

export interface IRNNJSONOptions {
  inputSize: number;
  inputRange: number;
  hiddenLayers: number[];
  outputSize: number;
  decayRate: number;
  smoothEps: number;
  regc: number;
  clipval: number;
  maxPredictionLength: number;
  dataFormatter: IDataFormatterJSON;
}

export interface IRNNTrainingOptions {
  iterations: number;
  errorThresh: number;
  log: boolean | ((status: INeuralNetworkState) => void);
  logPeriod: number;
  learningRate: number;
  callback?: (status: IRNNStatus) => void;
  callbackPeriod: number;
  timeout?: number;
}

export const trainDefaults: IRNNTrainingOptions = {
  iterations: 20000,
  errorThresh: 0.005,
  log: false,
  logPeriod: 10,
  learningRate: 0.01,
  callbackPeriod: 10,
};

export interface IRNNHiddenLayer {
  [key: string]: RandomMatrix | Matrix;
}

export interface IRNNHiddenLayerModel extends IRNNHiddenLayer {
  // wxh
  weight: RandomMatrix;
  // whh
  transition: RandomMatrix;
  // bhh
  bias: Matrix;
}

export const defaults = (): IRNNOptions => {
  return {
    inputSize: 20,
    inputRange: 20,
    hiddenLayers: [20, 20],
    outputSize: 20,
    decayRate: 0.999,
    smoothEps: 1e-8,
    regc: 0.000001,
    clipval: 5,
    maxPredictionLength: 100,
    dataFormatter: new DataFormatter(),
  };
};

export interface IRNNStatus {
  iterations: number;
  error: number;
}

export interface IRNNPreppedTrainingData {
  status: IRNNStatus;
  preparedData: number[][];
  endTime: number;
}

export class RNN {
  options: IRNNOptions = { ...defaults() };
  trainOpts: IRNNTrainingOptions = { ...trainDefaults };
  stepCache: { [index: number]: Float32Array } = {};
  runs = 0;
  ratioClipped = 0;
  model: IRNNModel = Object.seal({
    isInitialized: false,
    input: new Matrix(0, 0),
    hiddenLayers: [],
    output: new Matrix(0, 0),
    equations: [],
    allMatrices: [],
    equationConnections: [],
    outputConnector: new RandomMatrix(0, 0, 0.08),
  });

  initialLayerInputs: Matrix[] = [];

  constructor(options: Partial<IRNNOptions> = {}) {
    this.options = { ...this.options, ...options };
    this.updateTrainingOptions({
      ...trainDefaults,
      ...options,
    });

    if (options.json) {
      this.fromJSON(options.json);
    }
  }

  initialize(): void {
    const { dataFormatter } = this.options;
    if (dataFormatter?.characters.length) {
      this.options.inputSize = this.options.inputRange = this.options.outputSize =
        dataFormatter.characters.length;
    }
    this.model = this.mapModel();
  }

  createHiddenLayers(): IRNNHiddenLayer[] {
    const { hiddenLayers, inputSize } = this.options;
    const hiddenLayersModel: IRNNHiddenLayer[] = [];
    // 0 is end, so add 1 to offset
    hiddenLayersModel.push(this.getHiddenLayer(hiddenLayers[0], inputSize));
    let prevSize = hiddenLayers[0];

    for (let d = 1; d < hiddenLayers.length; d++) {
      // loop over depths
      const hiddenSize = hiddenLayers[d];
      hiddenLayersModel.push(this.getHiddenLayer(hiddenSize, prevSize));
      prevSize = hiddenSize;
    }
    return hiddenLayersModel;
  }

  getHiddenLayer(hiddenSize: number, prevSize: number): IRNNHiddenLayer {
    return {
      // wxh
      weight: new RandomMatrix(hiddenSize, prevSize, 0.08),
      // whh
      transition: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      // bhh
      bias: new Matrix(hiddenSize, 1),
    };
  }

  getEquation(
    equation: Equation,
    inputMatrix: Matrix,
    previousResult: Matrix,
    hiddenLayer: IRNNHiddenLayer
  ): Matrix {
    if (!hiddenLayer.weight || !hiddenLayer.transition || !hiddenLayer.bias) {
      throw new Error('hiddenLayer does not have expected properties');
    }
    const relu = equation.relu.bind(equation);
    const add = equation.add.bind(equation);
    const multiply = equation.multiply.bind(equation);

    return relu(
      add(
        add(
          multiply(hiddenLayer.weight, inputMatrix),
          multiply(hiddenLayer.transition, previousResult)
        ),
        hiddenLayer.bias
      )
    );
  }

  createInputMatrix(): RandomMatrix {
    const { inputRange, inputSize } = this.options;
    if (inputRange < 1)
      throw new Error('this.options.inputRange not an expected number');
    if (inputSize < 1)
      throw new Error('this.options.inputSize not an expected number');

    // 0 is end, so add 1 to offset
    return new RandomMatrix(inputRange + 1, inputSize, 0.08);
  }

  createOutputMatrices(): { outputConnector: RandomMatrix; output: Matrix } {
    const { outputSize, hiddenLayers } = this.options;
    const lastHiddenSize = last(hiddenLayers);

    // 0 is end, so add 1 to offset
    return {
      // whd
      outputConnector: new RandomMatrix(outputSize + 1, lastHiddenSize, 0.08),
      // 0 is end, so add 1 to offset
      // bd
      output: new Matrix(outputSize + 1, 1),
    };
  }

  bindEquation(): void {
    const { model } = this;
    const { hiddenLayers } = this.options;
    const equation = new Equation();
    const outputs: Matrix[] = [];
    const equationConnection =
      model.equationConnections.length > 0
        ? last(model.equationConnections)
        : this.initialLayerInputs;
    // 0 index
    let output = this.getEquation(
      equation,
      equation.inputMatrixToRow(model.input),
      equationConnection[0],
      model.hiddenLayers[0]
    );
    outputs.push(output);
    // 1+ indices
    for (let i = 1, max = hiddenLayers.length; i < max; i++) {
      if (!equationConnection[i]) {
        throw new Error(`Cannot find equation at index ${i}`);
      }
      output = this.getEquation(
        equation,
        output,
        equationConnection[i],
        model.hiddenLayers[i]
      );
      outputs.push(output);
    }

    model.equationConnections.push(outputs);
    equation.add(
      equation.multiply(model.outputConnector, output),
      model.output
    );
    model.equations.push(equation);
  }

  mapModel(): IRNNModel {
    const allMatrices: Matrix[] = [];
    this.initialLayerInputs = this.options.hiddenLayers.map(
      (size) => new Matrix(size, 1)
    );

    const input = this.createInputMatrix();
    allMatrices.push(input);

    const hiddenLayers = this.createHiddenLayers() as IRNNHiddenLayerModel[];
    if (!hiddenLayers.length) throw new Error('net.hiddenLayers not set');
    for (let i = 0, max = hiddenLayers.length; i < max; i++) {
      const hiddenMatrix: IRNNHiddenLayerModel = hiddenLayers[i];
      for (const property in hiddenMatrix) {
        if (!hiddenMatrix.hasOwnProperty(property)) continue;
        allMatrices.push(hiddenMatrix[property]);
      }
    }

    const { output, outputConnector } = this.createOutputMatrices();
    allMatrices.push(outputConnector);
    allMatrices.push(output);

    return Object.seal({
      isInitialized: true,
      input,
      hiddenLayers,
      output,
      equations: [],
      allMatrices,
      equationConnections: [],
      outputConnector,
    });
  }

  trainInput(input: number[]): number {
    this.runs++;
    const { model } = this;
    const max = input.length;
    let log2ppl = 0;
    let equation;
    while (model.equations.length <= input.length + 1) {
      // last is zero
      this.bindEquation();
    }
    for (
      let inputIndex = -1, inputMax = input.length;
      inputIndex < inputMax;
      inputIndex++
    ) {
      // start and end tokens are zeros
      const equationIndex = inputIndex + 1;
      equation = model.equations[equationIndex];

      const source = inputIndex === -1 ? 0 : input[inputIndex] + 1; // first step: start with START token
      const target = inputIndex === max - 1 ? 0 : input[inputIndex + 1] + 1; // last step: end with END token
      log2ppl += equation.predictTargetIndex(source, target);
    }
    return Math.pow(2, log2ppl / (max - 1)) / 100;
  }

  backpropagate(input: number[]): void {
    let i = input.length;
    const { model } = this;
    const { equations } = model;
    while (i > 0) {
      equations[i].backpropagateIndex(input[i - 1] + 1);
      i--;
    }
    equations[0].backpropagateIndex(0);
  }

  adjustWeights(): void {
    const { regc, clipval, decayRate, smoothEps } = this.options;
    const { trainOpts, model, stepCache } = this;
    const { learningRate } = trainOpts;
    const { allMatrices } = model;
    let numClipped = 0;
    let numTot = 0;
    for (let matrixIndex = 0; matrixIndex < allMatrices.length; matrixIndex++) {
      const matrix = allMatrices[matrixIndex];
      const { weights, deltas } = matrix;
      if (!(matrixIndex in stepCache)) {
        stepCache[matrixIndex] = zeros(matrix.rows * matrix.columns);
      }
      const cache = stepCache[matrixIndex];
      for (let i = 0; i < weights.length; i++) {
        let r = deltas[i];
        const w = weights[i];
        // rmsprop adaptive learning rate
        cache[i] = cache[i] * decayRate + (1 - decayRate) * r * r;
        // gradient clip
        if (r > clipval) {
          r = clipval;
          numClipped++;
        } else if (r < -clipval) {
          r = -clipval;
          numClipped++;
        }
        numTot++;
        // update (and regularize)
        weights[i] =
          w + (-learningRate * r) / Math.sqrt(cache[i] + smoothEps) - regc * w;
      }
    }
    this.ratioClipped = numClipped / numTot;
  }

  get isRunnable(): boolean {
    if (this.model && this.model.equations.length === 0) {
      console.error(`No equations bound, did you run train()?`);
      return false;
    }

    return true;
  }

  checkRunnable(): void {
    if (!this.isRunnable) {
      throw new Error('Network not runnable');
    }
  }

  run(rawInput: Value = [], isSampleI = false, temperature = 1): string {
    const maxPredictionLength: number =
      this.options.maxPredictionLength +
      (rawInput !== null ? (rawInput as string).length : 0) +
      (this.options.dataFormatter
        ? this.options.dataFormatter.specialIndexes.length
        : 0);

    this.checkRunnable();

    const input: number[] =
      this.options.dataFormatter && (rawInput as string).length > 0
        ? this.options.dataFormatter.formatDataIn(rawInput)
        : (rawInput as number[]);
    const { model } = this;
    const output = [];
    let i = 0;
    while (true) {
      const previousIndex =
        i === 0 ? 0 : i < input.length ? input[i - 1] + 1 : output[i - 1];
      while (model.equations.length <= i) {
        this.bindEquation();
      }
      const equation = model.equations[i];
      // sample predicted letter
      const outputMatrix = equation.runIndex(previousIndex);
      const logProbabilities = new Matrix(
        model.output.rows,
        model.output.columns
      );
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

      const probs = softmax(logProbabilities);
      const nextIndex = isSampleI ? sampleI(probs) : maxI(probs);

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
    return this.options.dataFormatter.formatDataOut(
      input,
      output.slice(input.length).map((value) => value - 1)
    );
  }

  /**
   *
   * Verifies network sizes are initialized
   * If they are not it will initialize them
   */
  verifyIsInitialized(): void {
    if (!this.model.isInitialized) {
      this.initialize();
    }
  }

  /**
   *
   * @param options
   *    Supports all `trainDefaults` properties
   *    also supports:
   *       learningRate: (number),
   *       momentum: (number),
   *       activation: 'sigmoid', 'relu', 'leaky-relu', 'tanh'
   */
  updateTrainingOptions(options: Partial<IRNNTrainingOptions>): void {
    this.trainOpts = { ...trainDefaults, ...options };
    this.validateTrainingOptions(this.trainOpts as INeuralNetworkTrainOptions);
    this.setLogMethod(options.log ?? this.trainOpts.log);
    // TODO: Remove this?
    // this.activation = options.activation || this.activation;
  }

  validateTrainingOptions(options: INeuralNetworkTrainOptions): void {
    NeuralNetwork.prototype.validateTrainingOptions.call(this, options);
  }

  /**
   *
   * @param log
   * if a method is passed in method is used
   * if false passed in nothing is logged
   * @returns error
   */
  setLogMethod(log: Log | undefined | boolean): void {
    if (typeof log === 'function') {
      this.trainOpts.log = log;
    } else if (log) {
      this.trainOpts.log = console.log;
    } else {
      this.trainOpts.log = false;
    }
  }

  protected prepTraining(
    data: Array<Value | IRNNDatum>,
    options: Partial<IRNNTrainingOptions>
  ): IRNNPreppedTrainingData {
    this.updateTrainingOptions(options);
    const preparedData = this.options.dataFormatter.format(data);
    const endTime = Date.now() + (this.trainOpts.timeout ?? 0);

    const status = {
      error: 1,
      iterations: 0,
    };

    this.verifyIsInitialized();

    return {
      preparedData,
      status,
      endTime,
    };
  }

  train(
    data: Array<Value | IRNNDatum>,
    trainOpts: Partial<IRNNTrainingOptions> = {}
  ): IRNNStatus {
    this.trainOpts = trainOpts = {
      ...trainDefaults,
      ...trainOpts,
    };
    const {
      iterations,
      errorThresh,
      logPeriod,
      callback,
      callbackPeriod,
    } = this.trainOpts;
    const log = trainOpts.log === true ? console.log : trainOpts.log;
    let error = Infinity;
    let i;

    let inputs: number[][];
    if (this.options?.dataFormatter) {
      inputs = this.options.dataFormatter.format(data);
    } else if (
      Array.isArray(data) &&
      Array.isArray(data[0]) &&
      typeof (data as number[][])[0][0] === 'number'
    ) {
      inputs = data as number[][];
    } else {
      throw new Error('training not in expected format of number[][]');
    }

    this.verifyIsInitialized();

    for (i = 0; i < iterations && error > errorThresh; i++) {
      let sum = 0;
      for (let j = 0; j < inputs.length; j++) {
        const err = trainPattern(this, inputs[j], true);
        sum += err;
      }
      error = sum / data.length;

      if (isNaN(error)) {
        throw new Error(
          'Network error rate is unexpected NaN, check network configurations and try again. Most probably input format is not correct or training data is not enough. '
        );
      }
      if (log && i % logPeriod === 0) {
        log(`iterations: ${i}, training error: ${error}`);
      }
      if (callback && i % callbackPeriod === 0) {
        callback({ error, iterations: i });
      }
    }

    return {
      error,
      iterations: i,
    };
  }

  addFormat(): void {
    throw new Error('not yet implemented');
  }

  toJSON(): IRNNJSON {
    if (!this.model.isInitialized) {
      this.initialize();
    }
    const { model, options } = this;

    return {
      type: this.constructor.name,
      options: { ...options, dataFormatter: options.dataFormatter.toJSON() },
      input: model.input.toJSON(),
      hiddenLayers: model.hiddenLayers.map((hiddenLayer) => {
        const layers: { [index: string]: IMatrixJSON } = {};
        for (const p in hiddenLayer) {
          if (!hiddenLayer.hasOwnProperty(p)) continue;
          layers[p] = hiddenLayer[p].toJSON();
        }
        return layers;
      }),
      outputConnector: this.model.outputConnector.toJSON(),
      output: this.model.output.toJSON(),
    };
  }

  fromJSON(json: IRNNJSON): void {
    const { options } = json;
    const allMatrices = [];
    const input = Matrix.fromJSON(json.input);
    allMatrices.push(input);
    const hiddenLayers: IRNNHiddenLayerModel[] = [];

    json.hiddenLayers.forEach((hiddenLayer) => {
      const layers: { [index: string]: Matrix } = {};
      for (const p in hiddenLayer) {
        layers[p] = Matrix.fromJSON(hiddenLayer[p]);
        allMatrices.push(layers[p]);
      }
      hiddenLayers.push(layers as IRNNHiddenLayerModel);
    });

    const outputConnector = Matrix.fromJSON(json.outputConnector);
    allMatrices.push(outputConnector);
    const output = Matrix.fromJSON(json.output);
    allMatrices.push(output);

    if (options.dataFormatter) {
      this.options = {
        ...defaults(),
        ...options,
        dataFormatter: DataFormatter.fromJSON(options.dataFormatter),
      };
    } else {
      this.options = {
        ...defaults(),
        ...options,
        dataFormatter: new DataFormatter(),
      };
    }

    this.model = Object.seal({
      isInitialized: true,
      input,
      hiddenLayers,
      output,
      allMatrices,
      outputConnector,
      equations: [],
      equationConnections: [],
    });
    this.initialLayerInputs = this.options.hiddenLayers.map(
      (size) => new Matrix(size, 1)
    );
    this.bindEquation();
  }

  toFunction(cb?: (src: string) => string): RNNFunction {
    const { model } = this;
    const { equations } = this.model;
    const equation = equations[1];
    const { states } = equation;
    const jsonString = JSON.stringify(this.toJSON());

    function previousConnectionIndex(m: Matrix): number {
      const connection = model.equationConnections[0];
      const { states } = equations[0];
      for (let i = 0, max = states.length; i < max; i++) {
        if (states[i].product === m) {
          return i;
        }
      }
      return connection.indexOf(m);
    }

    function matrixOrigin(m: Matrix, stateIndex: number): string {
      for (let i = 0, max = states.length; i < max; i++) {
        const state = states[i];

        if (i === stateIndex) {
          const j = previousConnectionIndex(m);
          if (j > -1 && (m === state.left || m === state.right)) {
            return `typeof prevStates[${j}] === 'object' ? prevStates[${j}].product : new Matrix(${m.rows}, ${m.columns})`;
          }
          return `new Matrix(${m.rows}, ${m.columns})`;
        }

        if (m === state.product) return `states[${i}].product`;
        if (m === state.right) return `states[${i}].right`;
        if (m === state.left) return `states[${i}].left`;
      }
      return '';
    }

    function matrixToString(m: Matrix, stateIndex: number): string {
      if (!m || !m.rows || !m.columns) return 'null';

      if (m === model.input) return `json.input`;
      if (m === model.outputConnector) return `json.outputConnector`;
      if (m === model.output) return `json.output`;

      for (let i = 0, max = model.hiddenLayers.length; i < max; i++) {
        const hiddenLayer = model.hiddenLayers[i];
        for (const p in hiddenLayer) {
          if (!hiddenLayer.hasOwnProperty(p)) continue;
          if (hiddenLayer[p] !== m) continue;
          return `json.hiddenLayers[${i}].${p}`;
        }
      }

      return matrixOrigin(m, stateIndex);
    }

    function toInner(fnString: string): string {
      // crude, but should be sufficient for now
      // function() { body }
      const fnParts = fnString.toString().split('{');
      fnParts.shift();
      // body }
      const fnBodyString = fnParts.join('{');
      const fnBodyParts = fnBodyString.split('}');
      fnBodyParts.pop();
      // body
      return fnBodyParts
        .join('}')
        .split('\n')
        .join('\n        ')
        .replace('product.deltas[i] = 0;', '')
        .replace('product.deltas[column] = 0;', '')
        .replace('left.deltas[leftIndex] = 0;', '')
        .replace('right.deltas[rightIndex] = 0;', '')
        .replace('product.deltas = left.deltas.slice(0);', '');
    }

    function fileName(fnName: string): string {
      return `src/recurrent/matrix/${fnName.replace(/[A-Z]/g, function (value) {
        return `-${value.toLowerCase()}`;
      })}.js`;
    }

    const statesRaw = [];
    const usedFunctionNames: { [methodName: string]: boolean } = {};
    const innerFunctionsSwitch = [];
    for (let i = 0, max = states.length; i < max; i++) {
      const state = states[i];
      statesRaw.push(`states[${i}] = {
      name: '${state.forwardFn.name}',
      left: ${state.left ? matrixToString(state.left, i) : 'undefined'},
      right: ${state.right ? matrixToString(state.right, i) : 'undefined'},
      product: ${matrixToString(state.product, i)}
    }`);

      const fnName = state.forwardFn.name;
      if (!usedFunctionNames[fnName]) {
        usedFunctionNames[fnName] = true;
        innerFunctionsSwitch.push(
          `        case '${fnName}': //compiled from ${fileName(fnName)}
          ${toInner(state.forwardFn.toString())}
          break;`
        );
      }
    }

    const src = `
  if (typeof rawInput === 'undefined') rawInput = [];
  if (typeof isSampleI === 'undefined') isSampleI = false;
  if (typeof temperature === 'undefined') temperature = 1;
  var json = ${jsonString};
  ${
    this.options.dataFormatter
      ? `${this.options.dataFormatter.toFunctionString()};
  Object.assign(dataFormatter, json.options.dataFormatter);`
      : ''
  }
  ${
    this.options.dataFormatter &&
    typeof this.options.dataFormatter.formatDataIn === 'function'
      ? `const formatDataIn = function (input, output) { ${toInner(
          this.options.dataFormatter.formatDataIn.toString()
        )} }.bind(dataFormatter);`
      : ''
  }
  ${
    this.options.dataFormatter !== null &&
    typeof this.options.dataFormatter.formatDataOut === 'function'
      ? `const formatDataOut = function formatDataOut(input, output) { ${toInner(
          this.options.dataFormatter.formatDataOut.toString()
        )} }.bind(dataFormatter);`
      : ''
  }
  var maxPredictionLength =
    ${this.options.maxPredictionLength} +
    rawInput.length +
    ${
      this.options.dataFormatter
        ? this.options.dataFormatter.specialIndexes.length
        : 0
    };
  var input = ${
    this.options.dataFormatter &&
    typeof this.options.dataFormatter.formatDataIn === 'function'
      ? 'formatDataIn(rawInput)'
      : 'rawInput'
  };
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
    prevStates = states;
    states = [];
    ${statesRaw.join(';\n    ')};
    for (var stateIndex = 0, stateMax = ${
      statesRaw.length
    }; stateIndex < stateMax; stateIndex++) {
      var state = states[stateIndex];
      var product = state.product;
      var left = state.left;
      var right = state.right;
      switch (state.name) {
${innerFunctionsSwitch.join('\n')}
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
  ${
    this.options.dataFormatter &&
    typeof this.options.dataFormatter.formatDataOut === 'function'
      ? 'return formatDataOut(input, output.slice(input.length).map(function(value) { return value - 1; }))'
      : 'return output.slice(input.length).map(function(value) { return value - 1; })'
  };
  function Matrix(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.weights = zeros(rows * columns);
  }
  ${zeros.toString()}
  ${softmax.toString().replace('_1.Matrix', 'Matrix')}
  ${randomFloat.toString()}
  ${sampleI.toString()}
  ${maxI.toString()}`;
    // eslint-disable-next-line
    return new Function(
      'rawInput',
      'isSampleI',
      'temperature',
      cb ? cb(src) : src
    ) as RNNFunction;
  }
}

export function trainPattern(
  net: RNN,
  input: number[],
  logErrorRate?: boolean
): number {
  const error = net.trainInput(input);
  net.backpropagate(input);
  net.adjustWeights();

  if (logErrorRate) {
    return error;
  }
  return 0;
}

export interface IRNNJSON {
  type: string;
  options: IRNNJSONOptions;
  input: IMatrixJSON;
  hiddenLayers: Array<{ [index: string]: IMatrixJSON }>;
  outputConnector: IMatrixJSON;
  output: IMatrixJSON;
}

export function last<T>(values: T[]): T {
  return values[values.length - 1];
}

export type RNNFunction = (
  rawInput?: Array<Value | IRNNDatum> | string,
  isSampleI?: boolean,
  temperature?: number
) => string;

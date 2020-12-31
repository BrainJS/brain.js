// const TrainStream from './train-stream');
import { Thaw } from 'thaw.js';
import { INumberHash, INumberObject, lookup } from './lookup';
import { arrayToFloat32Array } from './utilities/cast';
import { LookupTable } from './utilities/lookup-table';
import { max } from './utilities/max';
import { mse } from './utilities/mse';
import { randos } from './utilities/randos';
import { range } from './utilities/range';
import { zeros } from './utilities/zeros';

export interface INeuralNetworkOptions {
  /**
   * @default 0.5
   */
  binaryThresh: number;

  /**
   * array of int for the sizes of the hidden layers in the network
   *
   * @default [3]
   */
  hiddenLayers: number[];

  /**
   * supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
   *
   * @default 'sigmoid'
   */
  activation: NeuralNetworkActivation;

  /**
   * supported for activation type 'leaky-relu'
   *
   * @default 0.01
   */
  leakyReluAlpha: number;

  [x: string]: any;
}
export type NeuralNetworkActivation =
  | 'sigmoid'
  | 'relu'
  | 'leaky-relu'
  | 'tanh';

export interface INeuralNetworkTrainingOptions {
  /**
   * the maximum times to iterate the training data --> number greater than 0
   * @default 20000
   */
  iterations: number;

  /**
   * the acceptable error percentage from training data --> number between 0 and 1
   * @default 0.005
   */
  errorThresh: number;

  /**
   * true to use console.log, when a function is supplied it is used --> Either true or a function
   * @default false
   */
  log: boolean | INeuralNetworkTrainingCallback;

  /**
   * iterations between logging out --> number greater than 0
   * @default 10
   */
  logPeriod: number;

  /**
   * scales with delta to effect training rate --> number between 0 and 1
   * @default 0.3
   */
  learningRate: number;

  /**
   * scales with next layer's change value --> number between 0 and 1
   * @default 0.1
   */
  momentum: number;

  /**
   * a periodic call back that can be triggered while training --> null or function
   * @default null
   */
  callback: INeuralNetworkTrainingCallback | number | null;

  /**
   * the number of iterations through the training data between callback calls --> number greater than 0
   * @default 10
   */
  callbackPeriod: number;

  /**
   * the max number of milliseconds to train for --> number greater than 0
   * @default Infinity
   */
  timeout: number;
  praxis: null | 'adam';

  /**
   * @default 1e-8
   */
  epsilon: number;

  [x: string]: any;
}
export type INeuralNetworkTrainingCallback = (
  state: INeuralNetworkState
) => void;

export interface INeuralNetworkState {
  iterations: number;
  error: number;
}

export interface INeuralNetworkJSON {
  sizes: number[];
  // eslint-disable-next-line @typescript-eslint/ban-types
  layers: Array<
    Record<
      string | number,
      {
        bias: number;
        weights: Record<string, number>;
      }
    >
  >;
  outputLookup: INumberHash;
  inputLookup: INumberHash;
  activation: NeuralNetworkActivation;
  trainOpts: INeuralNetworkTrainingOptions;
  leakyReluAlpha?: number;
}

export interface INeuralNetworkTrainingData {
  input: NeuralNetworkInput;
  output: NeuralNetworkOutput;
}

export type NeuralNetworkInput = number[];

export type NeuralNetworkOutput = number[];

export interface INeuralNetworkTestResult {
  misclasses: any;
  error: number;
  total: number;
}

export interface INeuralNetworkBinaryTestResult
  extends INeuralNetworkTestResult {
  trueNeg: number;
  truePos: number;
  falseNeg: number;
  falsePos: number;
  precision: number;
  recall: number;
  accuracy: number;
}

function getTypedArrayFn(
  value: number[] | ArrayBuffer,
  table: Record<any, number>
): null | ((v: number[]) => Float32Array) {
  if (value.buffer instanceof ArrayBuffer) {
    return null;
  }
  if (Array.isArray(value)) {
    return arrayToFloat32Array;
  }
  const { length } = Object.keys(table);
  return (v: number[]) => {
    const array = new Float32Array(length);
    for (const p in table) {
      array[table[p]] = v[p] || 0;
    }
    return array;
  };
}

/**
 * @param {object} options
 * @constructor
 */
export class NeuralNetwork {
  static get trainDefaults(): INeuralNetworkTrainingOptions {
    return {
      iterations: 20000, // the maximum times to iterate the training data
      errorThresh: 0.005, // the acceptable error percentage from training data
      log: false, // true to use console.log, when a function is supplied it is used
      logPeriod: 10, // iterations between logging out
      learningRate: 0.3, // multiply's against the input and the delta then adds to momentum
      momentum: 0.1, // multiply's against the specified "change" then adds to learning rate for change
      callback: null, // a periodic call back that can be triggered while training
      callbackPeriod: 10, // the number of iterations through the training data between callback calls
      timeout: Infinity, // the max number of milliseconds to train for
      praxis: null,
      beta1: 0.9,
      beta2: 0.999,
      epsilon: 1e-8,
    };
  }

  static get defaults(): INeuralNetworkOptions {
    return {
      leakyReluAlpha: 0.01,
      binaryThresh: 0.5,
      hiddenLayers: [], // array of ints for the sizes of the hidden layers in the network
      activation: 'sigmoid', // Supported activation types ['sigmoid', 'relu', 'leaky-relu', 'tanh']
    };
  }

  trainOpts: INeuralNetworkTrainingOptions = { ...NeuralNetwork.trainDefaults };
  sizes: number[] = [];
  outputLayer = -1;
  // FIXME
  /** weight for bias nodes */
  biases: Float32Array[] = [];
  weights: Float32Array[][] = [];
  outputs: Float32Array[] = [];
  // state for training
  deltas: Float32Array[] = [];
  /** for momentum */
  changes: Float32Array[][] = [];
  errors: Float32Array[] = [];

  errorCheckInterval = 1;

  // FIXME
  runInput: (input: Float32Array) => Float32Array = this._runInputSigmoid;

  calculateDeltas: (input: number[]) => void = this._calculateDeltasSigmoid;

  inputLookup: INumberHash;
  inputLookupLength = -1;
  outputLookup: INumberHash;
  outputLookupLength = -1;

  activation: NeuralNetworkActivation = 'sigmoid';
  leakyReluAlpha = 0.01;
  binaryThresh = 0.5;
  hiddenLayers: number[] = [];

  biasChangesLow: Float32Array[] = [];
  biasChangesHigh: Float32Array[] = [];
  changesLow: Float32Array[][] = [];
  changesHigh: Float32Array[][] = [];
  iterations = 0;

  _formatInput: null | ((v: number[]) => Float32Array) = null;
  _formatOutput: null | ((v: number[]) => Float32Array) = null;

  constructor(options: Partial<INeuralNetworkOptions> = {}) {
    Object.assign(this, NeuralNetwork.defaults, options);
    this.updateTrainingOptions({
      ...NeuralNetwork.trainDefaults,
      ...options,
    });

    this.errorCheckInterval = 1;
    if (!this.constructor.prototype.hasOwnProperty('runInput')) {
      this.runInput = undefined;
    }
    if (!this.constructor.prototype.hasOwnProperty('calculateDeltas')) {
      this.calculateDeltas = undefined;
    }

    if (options.inputSize && options.hiddenLayers && options.outputSize) {
      this.sizes = [options.inputSize]
        .concat(options.hiddenLayers)
        .concat([options.outputSize]);
    }
  }

  /**
   *
   * Expects this.sizes to have been set
   */
  initialize(): void {
    if (!this.sizes) throw new Error('Sizes must be set before initializing');

    this.outputLayer = this.sizes.length - 1;
    this.biases = []; // weights for bias nodes
    this.weights = [];
    this.outputs = [];

    // state for training
    this.deltas = [];
    this.changes = []; // for momentum
    this.errors = [];

    for (let layer = 0; layer <= this.outputLayer; layer++) {
      const size = this.sizes[layer];
      this.deltas[layer] = zeros(size);
      this.errors[layer] = zeros(size);
      this.outputs[layer] = zeros(size);

      if (layer > 0) {
        this.biases[layer] = randos(size);
        this.weights[layer] = new Array(size);
        this.changes[layer] = new Array(size);

        for (let node = 0; node < size; node++) {
          const prevSize = this.sizes[layer - 1];
          this.weights[layer][node] = randos(prevSize);
          this.changes[layer][node] = zeros(prevSize);
        }
      }
    }

    this.setActivation();
    if (this.trainOpts.praxis === 'adam') {
      this._setupAdam();
    }
  }

  setActivation(activation?: NeuralNetworkActivation): void {
    this.activation = activation ?? this.activation;
    switch (this.activation) {
      case 'sigmoid':
        this.runInput = this.runInput || this._runInputSigmoid;
        this.calculateDeltas =
          this.calculateDeltas || this._calculateDeltasSigmoid;
        break;
      case 'relu':
        this.runInput = this.runInput || this._runInputRelu;
        this.calculateDeltas =
          this.calculateDeltas || this._calculateDeltasRelu;
        break;
      case 'leaky-relu':
        this.runInput = this.runInput || this._runInputLeakyRelu;
        this.calculateDeltas =
          this.calculateDeltas || this._calculateDeltasLeakyRelu;
        break;
      case 'tanh':
        this.runInput = this.runInput || this._runInputTanh;
        this.calculateDeltas =
          this.calculateDeltas || this._calculateDeltasTanh;
        break;
      default:
        throw new Error(
          `Unknown activation ${
            activation ?? 'undefined'
          }. Available activations are: 'sigmoid', 'relu', 'leaky-relu', 'tanh'`
        );
    }
  }

  /**
   *
   * @returns boolean
   */
  get isRunnable(): boolean {
    if (!this.runInput) {
      console.error(
        'Activation function has not been initialized, did you run train()?'
      );
      return false;
    }

    const checkFns = [
      this.sizes,
      this.outputLayer,
      this.biases,
      this.weights,
      this.outputs,
      this.deltas,
      this.changes,
      this.errors,
    ].filter((c) => {
      if (typeof c === 'number') {
        return c === -1;
      } else if (c.length === 0) {
        return true;
      }
      return false;
    });

    if (checkFns.length > 0) {
      console.error(
        `Some settings have not been initialized correctly, did you run train()? Found issues with: ${checkFns.join(
          ', '
        )}`
      );
      return false;
    }
    return true;
  }

  /**
   *
   * @param input
   * @returns {*}
   */
  // FIXME any
  run(input: INumberObject): INumberHash | null {
    let float32Input = null;
    if (!this.isRunnable) return null;
    if (this.inputLookup) {
      float32Input = lookup.toArray(
        this.inputLookup,
        input,
        this.inputLookupLength
      );
    }
    let _output;
    if (float32Input !== null) {
      _output = this.runInput(float32Input).slice(0);
    } else {
      _output = this.runInput(input).slice(0);
    }
    let output = null;
    if (this.outputLookup) {
      output = lookup.toObject(this.outputLookup, _output);
    }
    return output;
  }

  _runInputSigmoid(input: Float32Array): Float32Array {
    this.outputs[0] = input; // set output state of input layer

    let output: Float32Array = new Float32Array(0);
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      const activeLayer = this.sizes[layer];
      const activeWeights = this.weights[layer];
      const activeBiases = this.biases[layer];
      const activeOutputs = this.outputs[layer];
      for (let node = 0; node < activeLayer; node++) {
        const weights = activeWeights[node];

        let sum = activeBiases[node];
        for (let k = 0; k < weights.length; k++) {
          sum += weights[k] * input[k];
        }
        // sigmoid
        activeOutputs[node] = 1 / (1 + Math.exp(-sum));
      }
      output = input = this.outputs[layer];
    }
    return output;
  }

  _runInputRelu(input: Float32Array): Float32Array {
    this.outputs[0] = input; // set output state of input layer

    let output: Float32Array = new Float32Array(0);
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      const currentSize = this.sizes[layer];
      const currentWeights = this.weights[layer];
      const currentBiases = this.biases[layer];
      const currentOutputs = this.outputs[layer];
      for (let node = 0; node < currentSize; node++) {
        const weights = currentWeights[node];

        let sum = currentBiases[node];
        for (let k = 0; k < weights.length; k++) {
          sum += weights[k] * input[k];
        }
        // relu
        currentOutputs[node] = sum < 0 ? 0 : sum;
      }
      output = input = currentOutputs;
    }
    return output;
  }

  _runInputLeakyRelu(input: Float32Array): Float32Array {
    this.outputs[0] = input; // set output state of input layer
    const alpha = this.leakyReluAlpha;
    let output: Float32Array = new Float32Array(0);
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      const currentSize = this.sizes[layer];
      const currentWeights = this.weights[layer];
      const currentBiases = this.biases[layer];
      const currentOutputs = this.outputs[layer];
      for (let node = 0; node < currentSize; node++) {
        const weights = currentWeights[node];

        let sum = currentBiases[node];
        for (let k = 0; k < weights.length; k++) {
          sum += weights[k] * input[k];
        }
        // leaky relu
        currentOutputs[node] = Math.max(sum, alpha * sum);
      }
      output = input = currentOutputs;
    }
    return output;
  }

  _runInputTanh(input: Float32Array): Float32Array {
    this.outputs[0] = input; // set output state of input layer

    let output: Float32Array = new Float32Array(0);
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      const currentSize = this.sizes[layer];
      const currentWeights = this.weights[layer];
      const currentBiases = this.biases[layer];
      const currentOutputs = this.outputs[layer];
      for (let node = 0; node < currentSize; node++) {
        const weights = currentWeights[node];

        let sum = currentBiases[node];
        for (let k = 0; k < weights.length; k++) {
          sum += weights[k] * input[k];
        }
        // tanh
        currentOutputs[node] = Math.tanh(sum);
      }
      output = input = currentOutputs;
    }
    return output;
  }

  /**
   * Verifies network sizes are initialized
   * If they are not it will initialize them based off the data set.
   */
  verifyIsInitialized(data: any): void {
    if (this.sizes) return;

    this.sizes = [];
    this.sizes.push(data[0].input.length);
    if (!this.hiddenLayers) {
      this.sizes.push(Math.max(3, Math.floor(data[0].input.length / 2)));
    } else {
      this.hiddenLayers.forEach((size) => {
        this.sizes.push(size);
      });
    }
    this.sizes.push(data[0].output.length);

    this.initialize();
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
  updateTrainingOptions(options: Partial<INeuralNetworkOptions>): void {
    const { trainDefaults } = NeuralNetwork;
    for (const p in trainDefaults) {
      if (!trainDefaults.hasOwnProperty(p)) continue;
      this.trainOpts[p] = options.hasOwnProperty(p)
        ? options[p]
        : trainDefaults[p];
    }
    this.validateTrainingOptions(this.trainOpts);
    this.setLogMethod(options.log || this.trainOpts.log);
    this.activation = options.activation ?? this.activation;
  }

  /**
   *
   * @param options
   */
  validateTrainingOptions(
    options: Partial<INeuralNetworkTrainingOptions>
  ): void {
    const validations = {
      iterations: (val: any) => {
        return typeof val === 'number' && val > 0;
      },
      errorThresh: (val: any) => {
        return typeof val === 'number' && val > 0 && val < 1;
      },
      log: (val: any) => {
        return typeof val === 'function' || typeof val === 'boolean';
      },
      logPeriod: (val: any) => {
        return typeof val === 'number' && val > 0;
      },
      learningRate: (val: any) => {
        return typeof val === 'number' && val > 0 && val < 1;
      },
      momentum: (val: any) => {
        return typeof val === 'number' && val > 0 && val < 1;
      },
      callback: (val: any) => {
        return typeof val === 'function' || val === null;
      },
      callbackPeriod: (val: any) => {
        return typeof val === 'number' && val > 0;
      },
      timeout: (val: any) => {
        return typeof val === 'number' && val > 0;
      },
    };
    let p: keyof (typeof validations & typeof validations);
    for (p in validations) {
      if (!validations.hasOwnProperty(p)) continue;
      if (!options.hasOwnProperty(p)) continue;
      else if (!validations[p](options[p])) {
        throw new Error(
          `[${p}, ${
            options[p]?.toString() ?? 'undefined'
          }] is out of normal training range, your network will probably not train.`
        );
      }
    }
  }

  /**
   *
   *  Gets JSON of trainOpts object
   *    NOTE: Activation is stored directly on JSON object and not in the training options
   */
  getTrainOptsJSON(): INeuralNetworkTrainingOptions {
    return Object.keys(NeuralNetwork.trainDefaults).reduce(
      (opts, opt) => {
        if (opt === 'timeout' && this.trainOpts[opt] === Infinity) return opts;
        if (opt === 'callback') return opts;
        if (this.trainOpts[opt]) opts[opt] = this.trainOpts[opt];
        if (opt === 'log') opts.log = typeof opts.log === 'function';
        return opts;
      },
      { ...NeuralNetwork.trainDefaults }
    );
  }

  /**
   *
   * @param log
   * if a method is passed in method is used
   * if false passed in nothing is logged
   * @returns error
   */
  setLogMethod(log: INeuralNetworkTrainingCallback | boolean): void {
    if (typeof log === 'function') {
      this.trainOpts.log = log;
    } else if (log) {
      this.trainOpts.log = this.logTrainingStatus;
    } else {
      this.trainOpts.log = false;
    }
  }

  /**
   * log training status
   */
  logTrainingStatus(status: INeuralNetworkState): void {
    console.log(
      `iterations: ${status.iterations}, training error: ${status.error}`
    );
  }

  /**
   *
   * @param data
   * @returns {Number} error
   */
  calculateTrainingError(data: INeuralNetworkTrainingData[]): number {
    let sum = 0;
    for (let i = 0; i < data.length; ++i) {
      // trainPattern should be overloaded properly for this to work
      sum += this.trainPattern(data[i], true) as number;
    }
    return sum / data.length;
  }

  trainPatterns(data: INeuralNetworkTrainingData[]): void {
    for (let i = 0; i < data.length; ++i) {
      this.trainPattern(data[i]);
    }
  }

  trainingTick(
    data: INeuralNetworkTrainingData[],
    status: INeuralNetworkState,
    endTime: number
  ): boolean {
    const {
      callback,
      callbackPeriod,
      errorThresh,
      iterations,
      log,
      logPeriod,
    } = this.trainOpts;

    if (
      status.iterations >= iterations ||
      status.error <= errorThresh ||
      Date.now() >= endTime
    ) {
      return false;
    }

    status.iterations++;

    if (typeof log === 'function' && status.iterations % logPeriod === 0) {
      status.error = this.calculateTrainingError(data);
      log(status);
    } else if (status.iterations % this.errorCheckInterval === 0) {
      status.error = this.calculateTrainingError(data);
    } else {
      this.trainPatterns(data);
    }

    if (
      typeof callback === 'function' &&
      status.iterations % callbackPeriod === 0
    ) {
      callback({
        iterations: status.iterations,
        error: status.error,
      });
    }
    return true;
  }

  /**
   *
   * @param data
   * @param options
   * @protected
   * @return {object} { data, status, endTime }
   */
  prepTraining<T>(
    data: T | INeuralNetworkTrainingData[],
    options: Partial<INeuralNetworkTrainingOptions>
  ): {
    data: INeuralNetworkTrainingData[];
    status: INeuralNetworkState;
    endTime: number;
  } {
    this.updateTrainingOptions(options);
    data = this.formatData(data);
    const endTime = Date.now() + this.trainOpts.timeout;

    const status = {
      error: 1,
      iterations: 0,
    };

    this.verifyIsInitialized(data);

    return {
      data,
      status,
      endTime,
    };
  }

  /**
   *
   * @param data
   * @param options
   * @returns {{error: number, iterations: number}} {error: number, iterations: number}
   */
  train<T>(
    data: T | INeuralNetworkTrainingData[],
    options: Partial<INeuralNetworkTrainingOptions> = {}
  ): INeuralNetworkState {
    let status;
    let endTime;

    ({ data, status, endTime } = this.prepTraining(data, {
      ...this.trainOpts,
      ...options,
    }));

    while (this.trainingTick(data, status, endTime));
    return status;
  }

  /**
   *
   * @param data
   * @param options
   * @returns {Promise}
   * @resolves {{error: number, iterations: number}}
   * @rejects {{trainError: string, status: {error: number, iterations: number}}
   */
  async trainAsync<T>(
    data: T | INeuralNetworkTrainingData[],
    options: Partial<INeuralNetworkTrainingOptions> = {}
  ): Promise<INeuralNetworkState> {
    const prepedVals = this.prepTraining(data, options);
    const status = prepedVals.status;
    const endTime = prepedVals.endTime;
    const usedData = prepedVals.data;

    return await new Promise((resolve, reject) => {
      try {
        const thawedTrain = new Thaw(new Array(this.trainOpts.iterations), {
          delay: true,
          each: () =>
            this.trainingTick(usedData, status, endTime) || thawedTrain.stop(),
          done: () => resolve(status),
        });
        thawedTrain.tick();
      } catch (trainError) {
        console.log(JSON.stringify(trainError));
        reject(new Error(JSON.stringify({ trainError, status })));
      }
    });
  }

  /**
   * @param logErrorRate - default false
   */
  trainPattern(
    value: INeuralNetworkTrainingData,
    logErrorRate = false
  ): number | null {
    // forward propagate
    this.runInput(value.input);

    // back propagate
    this.calculateDeltas(value.output);
    this.adjustWeights();

    if (logErrorRate) {
      return mse(this.errors[this.outputLayer]);
    }
    return null;
  }

  _calculateDeltasSigmoid(target: number[]): void {
    for (let layer = this.outputLayer; layer >= 0; layer--) {
      const activeSize = this.sizes[layer];
      const activeOutput = this.outputs[layer];
      const activeError = this.errors[layer];
      const activeDeltas = this.deltas[layer];
      const nextLayer = this.weights[layer + 1];

      for (let node = 0; node < activeSize; node++) {
        const output = activeOutput[node];

        let error = 0;
        if (layer === this.outputLayer) {
          error = target[node] - output;
        } else {
          const deltas = this.deltas[layer + 1];
          for (let k = 0; k < deltas.length; k++) {
            error += deltas[k] * nextLayer[k][node];
          }
        }
        activeError[node] = error;
        activeDeltas[node] = error * output * (1 - output);
      }
    }
  }

  _calculateDeltasRelu(target: number[]): void {
    for (let layer = this.outputLayer; layer >= 0; layer--) {
      const currentSize = this.sizes[layer];
      const currentOutputs = this.outputs[layer];
      const nextWeights = this.weights[layer + 1];
      const nextDeltas = this.deltas[layer + 1];
      const currentErrors = this.errors[layer];
      const currentDeltas = this.deltas[layer];

      for (let node = 0; node < currentSize; node++) {
        const output = currentOutputs[node];

        let error = 0;
        if (layer === this.outputLayer) {
          error = target[node] - output;
        } else {
          for (let k = 0; k < nextDeltas.length; k++) {
            error += nextDeltas[k] * nextWeights[k][node];
          }
        }
        currentErrors[node] = error;
        currentDeltas[node] = output > 0 ? error : 0;
      }
    }
  }

  _calculateDeltasLeakyRelu(target: number[]): void {
    const alpha = this.leakyReluAlpha;
    for (let layer = this.outputLayer; layer >= 0; layer--) {
      const currentSize = this.sizes[layer];
      const currentOutputs = this.outputs[layer];
      const nextDeltas = this.deltas[layer + 1];
      const nextWeights = this.weights[layer + 1];
      const currentErrors = this.errors[layer];
      const currentDeltas = this.deltas[layer];

      for (let node = 0; node < currentSize; node++) {
        const output = currentOutputs[node];

        let error = 0;
        if (layer === this.outputLayer) {
          error = target[node] - output;
        } else {
          for (let k = 0; k < nextDeltas.length; k++) {
            error += nextDeltas[k] * nextWeights[k][node];
          }
        }
        currentErrors[node] = error;
        currentDeltas[node] = output > 0 ? error : alpha * error;
      }
    }
  }

  _calculateDeltasTanh(target: number[]): void {
    for (let layer = this.outputLayer; layer >= 0; layer--) {
      const currentSize = this.sizes[layer];
      const currentOutputs = this.outputs[layer];
      const nextDeltas = this.deltas[layer + 1];
      const nextWeights = this.weights[layer + 1];
      const currentErrors = this.errors[layer];
      const currentDeltas = this.deltas[layer];

      for (let node = 0; node < currentSize; node++) {
        const output = currentOutputs[node];

        let error = 0;
        if (layer === this.outputLayer) {
          error = target[node] - output;
        } else {
          for (let k = 0; k < nextDeltas.length; k++) {
            error += nextDeltas[k] * nextWeights[k][node];
          }
        }
        currentErrors[node] = error;
        currentDeltas[node] = (1 - output * output) * error;
      }
    }
  }

  /**
   * Changes weights of networks
   */
  adjustWeights(): void {
    const { learningRate, momentum } = this.trainOpts;
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      const incoming = this.outputs[layer - 1];
      const activeSize = this.sizes[layer];
      const activeDelta = this.deltas[layer];
      const activeChanges = this.changes[layer];
      const activeWeights = this.weights[layer];
      const activeBiases = this.biases[layer];

      for (let node = 0; node < activeSize; node++) {
        const delta = activeDelta[node];

        for (let k = 0; k < incoming.length; k++) {
          let change = activeChanges[node][k];

          change = learningRate * delta * incoming[k] + momentum * change;

          activeChanges[node][k] = change;
          activeWeights[node][k] += change;
        }
        activeBiases[node] += learningRate * delta;
      }
    }
  }

  _setupAdam(): void {
    this.biasChangesLow = [];
    this.biasChangesHigh = [];
    this.changesLow = [];
    this.changesHigh = [];
    this.iterations = 0;

    for (let layer = 0; layer <= this.outputLayer; layer++) {
      const size = this.sizes[layer];
      if (layer > 0) {
        this.biasChangesLow[layer] = zeros(size);
        this.biasChangesHigh[layer] = zeros(size);
        this.changesLow[layer] = new Array(size);
        this.changesHigh[layer] = new Array(size);

        for (let node = 0; node < size; node++) {
          const prevSize = this.sizes[layer - 1];
          this.changesLow[layer][node] = zeros(prevSize);
          this.changesHigh[layer][node] = zeros(prevSize);
        }
      }
    }

    this.adjustWeights = this._adjustWeightsAdam;
  }

  _adjustWeightsAdam(): void {
    this.iterations++;

    const { iterations } = this;
    const { beta1, beta2, epsilon, learningRate } = this.trainOpts;

    for (let layer = 1; layer <= this.outputLayer; layer++) {
      const incoming = this.outputs[layer - 1];
      const currentSize = this.sizes[layer];
      const currentDeltas = this.deltas[layer];
      const currentChangesLow = this.changesLow[layer];
      const currentChangesHigh = this.changesHigh[layer];
      const currentWeights = this.weights[layer];
      const currentBiases = this.biases[layer];
      const currentBiasChangesLow = this.biasChangesLow[layer];
      const currentBiasChangesHigh = this.biasChangesHigh[layer];

      for (let node = 0; node < currentSize; node++) {
        const delta = currentDeltas[node];

        for (let k = 0; k < incoming.length; k++) {
          const gradient = delta * incoming[k];
          const changeLow =
            currentChangesLow[node][k] * beta1 + (1 - beta1) * gradient;
          const changeHigh =
            currentChangesHigh[node][k] * beta2 +
            (1 - beta2) * gradient * gradient;

          const momentumCorrection =
            changeLow / (1 - Math.pow(beta1, iterations));
          const gradientCorrection =
            changeHigh / (1 - Math.pow(beta2, iterations));

          currentChangesLow[node][k] = changeLow;
          currentChangesHigh[node][k] = changeHigh;
          currentWeights[node][k] +=
            (learningRate * momentumCorrection) /
            (Math.sqrt(gradientCorrection) + epsilon);
        }

        const biasGradient = currentDeltas[node];
        const biasChangeLow =
          currentBiasChangesLow[node] * beta1 + (1 - beta1) * biasGradient;
        const biasChangeHigh =
          currentBiasChangesHigh[node] * beta2 +
          (1 - beta2) * biasGradient * biasGradient;

        const biasMomentumCorrection =
          currentBiasChangesLow[node] / (1 - Math.pow(beta1, iterations));
        const biasGradientCorrection =
          currentBiasChangesHigh[node] / (1 - Math.pow(beta2, iterations));

        currentBiasChangesLow[node] = biasChangeLow;
        currentBiasChangesHigh[node] = biasChangeHigh;
        currentBiases[node] +=
          (learningRate * biasMomentumCorrection) /
          (Math.sqrt(biasGradientCorrection) + epsilon);
      }
    }
  }

  /**
   *
   * @param data
   * @returns {*}
   */
  // FIXME
  formatData<T>(
    data: T | INeuralNetworkTrainingData[]
  ): INeuralNetworkTrainingData[] {
    if (!Array.isArray(data)) {
      // turn stream datum into array
      data = [data];
    }

    if (!Array.isArray(data[0].input)) {
      if (this.inputLookup) {
        this.inputLookupLength = Object.keys(this.inputLookup).length;
      } else {
        const inputLookup = new LookupTable(data, 'input');
        this.inputLookup = inputLookup.table;
        this.inputLookupLength = inputLookup.length;
      }
    }

    if (!Array.isArray(data[0].output)) {
      if (this.outputLookup) {
        this.outputLookupLength = Object.keys(this.outputLookup).length;
      } else {
        const lookup = new LookupTable(data, 'output');
        this.outputLookup = lookup.table;
        this.outputLookupLength = lookup.length;
      }
    }

    if (typeof this._formatInput === 'undefined') {
      this._formatInput = getTypedArrayFn(data[0].input, this.inputLookup);
      this._formatOutput = getTypedArrayFn(data[0].output, this.outputLookup);
    }

    // turn sparse hash input into arrays with 0s as filler
    if (this._formatInput && this._formatOutput) {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        result.push({
          input: this._formatInput(data[i].input),
          output: this._formatOutput(data[i].output),
        });
      }
      return result;
    }
    if (this._formatInput) {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        result.push({
          input: this._formatInput(data[i].input),
          output: data[i].output,
        });
      }
      return result;
    }
    if (this._formatOutput) {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        result.push({
          input: data[i].input,
          output: this._formatOutput(data[i].output),
        });
      }
      return result;
    }
    return data;
  }

  // FIXME
  addFormat(data: any): void {
    this.inputLookup = lookup.addKeys(data.input, this.inputLookup);
    if (this.inputLookup) {
      this.inputLookupLength = Object.keys(this.inputLookup).length;
    }
    this.outputLookup = lookup.addKeys(data.output, this.outputLookup);
    if (this.outputLookup) {
      this.outputLookupLength = Object.keys(this.outputLookup).length;
    }
  }

  test(
    data: INeuralNetworkTrainingData[]
  ): INeuralNetworkBinaryTestResult | INeuralNetworkTestResult {
    data = this.formatData(data);
    // for binary classification problems with one output node
    const isBinary = data[0].output.length === 1;
    // for classification problems
    const misclasses = [];
    // run each pattern through the trained network and collect
    // error and misclassification statistics
    let errorSum = 0;

    if (isBinary) {
      let falsePos = 0;
      let falseNeg = 0;
      let truePos = 0;
      let trueNeg = 0;

      for (let i = 0; i < data.length; i++) {
        const output = this.runInput(data[i].input);
        const target = data[i].output;
        const actual = output[0] > this.binaryThresh ? 1 : 0;
        const expected = target[0];

        if (actual !== expected) {
          const misclass = data[i];
          misclasses.push({
            input: misclass.input,
            output: misclass.output,
            actual,
            expected,
          });
        }

        if (actual === 0 && expected === 0) {
          trueNeg++;
        } else if (actual === 1 && expected === 1) {
          truePos++;
        } else if (actual === 0 && expected === 1) {
          falseNeg++;
        } else if (actual === 1 && expected === 0) {
          falsePos++;
        }

        errorSum += mse(
          output.map((value, i) => {
            return target[i] - value;
          })
        );
      }

      return {
        error: errorSum / data.length,
        misclasses,
        total: data.length,
        trueNeg,
        truePos,
        falseNeg,
        falsePos,
        precision: truePos > 0 ? truePos / (truePos + falsePos) : 0,
        recall: truePos > 0 ? truePos / (truePos + falseNeg) : 0,
        accuracy: (trueNeg + truePos) / data.length,
      };
    }

    for (let i = 0; i < data.length; i++) {
      const output = this.runInput(data[i].input);
      const target = data[i].output;
      const actual = output.indexOf(max(output));
      const expected = target.indexOf(max(target));

      if (actual !== expected) {
        const misclass = data[i];
        misclasses.push({
          input: misclass.input,
          output: misclass.output,
          actual,
          expected,
        });
      }

      errorSum += mse(
        output.map((value, i) => {
          return target[i] - value;
        })
      );
    }
    return {
      error: errorSum / data.length,
      misclasses,
      total: data.length,
    };
  }

  toJSON(): INeuralNetworkJSON {
    if (this.sizes === null) {
      this.initialize();
    }
    const layers: Array<Record<
      string | number,
      {
        bias: number;
        weights: Record<string, number>;
      }
    >> = [];
    for (let layer = 0; layer <= this.outputLayer; layer++) {
      layers[layer] = {};

      let nodes;
      // turn any internal arrays back into hashes for readable json
      if (layer === 0 && this.inputLookup) {
        nodes = Object.keys(this.inputLookup);
      } else if (this.outputLookup && layer === this.outputLayer) {
        nodes = Object.keys(this.outputLookup);
      } else {
        nodes = range(0, this.sizes[layer]);
      }

      for (let j = 0; j < nodes.length; j++) {
        const node = nodes[j];
        layers[layer][node] = {
          bias: -1,
          weights: {},
        };

        if (layer > 0) {
          layers[layer][node].bias = this.biases[layer][j];
          layers[layer][node].weights = {};
          for (const k in layers[layer - 1]) {
            let index: string | number = k;
            if (layer === 1 && this.inputLookup) {
              index = this.inputLookup[k];
            }
            layers[layer][node].weights[k] = this.weights[layer][j][
              index as number
            ];
          }
        }
      }
    }
    return {
      sizes: this.sizes.slice(0),
      layers,
      outputLookup: this.outputLookup !== null,
      inputLookup: this.inputLookup !== null,
      activation: this.activation,
      trainOpts: this.getTrainOptsJSON(),
    };
  }

  /**
   *
   * @param json
   * @returns {NeuralNetwork}
   */
  fromJSON(json: INeuralNetworkJSON): NeuralNetwork {
    Object.assign(this, NeuralNetwork.defaults, json);
    this.sizes = json.sizes;
    this.initialize();

    for (let i = 0; i <= this.outputLayer; i++) {
      const layer = json.layers[i];
      if (i === 0 && (!layer[0] || json.inputLookup)) {
        this.inputLookup = lookup.toHash(layer);
        this.inputLookupLength = Object.keys(this.inputLookup).length;
      } else if (i === this.outputLayer && (!layer[0] || json.outputLookup)) {
        this.outputLookup = lookup.toHash(layer);
      }
      if (i > 0) {
        const nodes = Object.keys(layer);
        this.sizes[i] = nodes.length;
        for (const node of nodes) {
          this.biases[i][j] = layer[node].bias;
          this.weights[i][j] = arrayToFloat32Array(layer[node].weights);
        }
      }
    }
    if (json.hasOwnProperty('trainOpts')) {
      this.updateTrainingOptions(json.trainOpts);
    }
    return this;
  }

  /**
   * @param {Function} [cb]
   * @returns {Function}
   */
  toFunction(cb) {
    const { activation } = this;
    const { leakyReluAlpha } = this;
    let needsVar = false;
    function nodeHandle(layers, layerNumber, nodeKey) {
      if (layerNumber === 0) {
        return typeof nodeKey === 'string'
          ? `(input['${nodeKey}']||0)`
          : `(input[${nodeKey}]||0)`;
      }

      const layer = layers[layerNumber];
      const node = layer[nodeKey];
      const result = ['(', node.bias];
      for (const w in node.weights) {
        if (node.weights[w] < 0) {
          result.push(
            `${node.weights[w]}*${nodeHandle(layers, layerNumber - 1, w)}`
          );
        } else {
          result.push(
            `+${node.weights[w]}*${nodeHandle(layers, layerNumber - 1, w)}`
          );
        }
      }
      result.push(')');

      switch (activation) {
        case 'sigmoid':
          return `1/(1+1/Math.exp(${result.join('')}))`;
        case 'relu': {
          needsVar = true;
          return `((v=${result.join('')})<0?0:v)`;
        }
        case 'leaky-relu': {
          needsVar = true;
          return `((v=${result.join('')})<0?0:${leakyReluAlpha}*v)`;
        }
        case 'tanh':
          return `Math.tanh(${result.join('')})`;
        default:
          throw new Error(
            `Unknown activation ${this.activation}. Available activations are: 'sigmoid', 'relu', 'leaky-relu', 'tanh'`
          );
      }
    }

    const { layers } = this.toJSON();
    const layersAsMath = [];
    let result;
    for (const i in layers[layers.length - 1]) {
      layersAsMath.push(nodeHandle(layers, layers.length - 1, i));
    }
    if (this.outputLookup) {
      result = `{${Object.keys(this.outputLookup).map(
        (key, i) => `'${key}':${layersAsMath[i]}`
      )}}`;
    } else {
      result = `[${layersAsMath.join(',')}]`;
    }

    const source = `${needsVar ? 'var v;' : ''}return ${result};`;
    // eslint-disable-next-line no-new-func
    return new Function('input', cb ? cb(source) : source);
  }
}

NeuralNetwork.fromJSON = undefined;

// module.exports = NeuralNetwork;
export default NeuralNetwork;

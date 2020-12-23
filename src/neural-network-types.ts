/** The following should be moved to neural-network.ts once that is converted to typescript. Added here until neural-network.js is converted */
export interface INeuralNetworkOptions {
  /**
   * @default 0.5
   */
  binaryThresh?: number;

  /**
   * array of int for the sizes of the hidden layers in the network
   *
   * @default [3]
   */
  hiddenLayers?: number[];

  /**
   * supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
   *
   * @default 'sigmoid'
   */
  activation?: NeuralNetworkActivation;

  /**
   * supported for activation type 'leaky-relu'
   *
   * @default 0.01
   */
  leakyReluAlpha?: number;
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
  iterations?: number;

  /**
   * the acceptable error percentage from training data --> number between 0 and 1
   * @default 0.005
   */
  errorThresh?: number;

  /**
   * true to use console.log, when a function is supplied it is used --> Either true or a function
   * @default false
   */
  log?: boolean | INeuralNetworkTrainingCallback;

  /**
   * iterations between logging out --> number greater than 0
   * @default 10
   */
  logPeriod?: number;

  /**
   * scales with delta to effect training rate --> number between 0 and 1
   * @default 0.3
   */
  learningRate?: number;

  /**
   * scales with next layer's change value --> number between 0 and 1
   * @default 0.1
   */
  momentum?: number;

  /**
   * a periodic call back that can be triggered while training --> null or function
   * @default null
   */
  callback?: INeuralNetworkTrainingCallback | number;

  /**
   * the number of iterations through the training data between callback calls --> number greater than 0
   * @default 10
   */
  callbackPeriod?: number;

  /**
   * the max number of milliseconds to train for --> number greater than 0
   * @default Infinity
   */
  timeout?: number;
  praxis?: null | 'adam';
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
  layers: object[];
  outputLookup: any;
  inputLookup: any;
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
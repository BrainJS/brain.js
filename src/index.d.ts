/* NeuralNetwork section */
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

export type NeuralNetworkActivation = 'sigmoid' | 'relu' | 'leaky-relu' | 'tanh';

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
  praxis?: null | 'adam'
}

export interface INeuralNetworkTrainingCallback {
  (state: INeuralNetworkState): void;
}

export interface INeuralNetworkState {
  iterations: number;
  error: number;
}

export interface INeuralNetworkJSON {
  sizes: number[];
  layers: object[];
  outputLookup: any;
  inputLookup: any;
  activation: NeuralNetworkActivation,
  trainOpts: INeuralNetworkTrainingOptions,
  leakyReluAlpha?: number,
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

export interface INeuralNetworkBinaryTestResult extends INeuralNetworkTestResult {
  trueNeg: number;
  truePos: number;
  falseNeg: number;
  falsePos: number;
  precision: number;
  recall: number;
  accuracy: number;
}

export class NeuralNetwork {
  public constructor(options?: INeuralNetworkOptions);
  public train(data: INeuralNetworkTrainingData[], options?: INeuralNetworkTrainingOptions): INeuralNetworkState;
  public train<T>(data: T, options?: INeuralNetworkTrainingOptions): INeuralNetworkState;
  public trainAsync(data: INeuralNetworkTrainingData, options?: INeuralNetworkTrainingOptions): Promise<INeuralNetworkState>;
  public trainAsync<T>(data: T, options?: INeuralNetworkTrainingOptions): Promise<INeuralNetworkState>;
  public test(data: INeuralNetworkTrainingData): INeuralNetworkTestResult | INeuralNetworkBinaryTestResult;
  public run(data: NeuralNetworkInput): NeuralNetworkInput;
  public run<T>(data: NeuralNetworkInput): T;
  public run<TInput, TOutput>(data: TInput): TOutput;
  public fromJSON(json: INeuralNetworkJSON): NeuralNetwork;
  public toJSON(): INeuralNetworkJSON;
}

export class NeuralNetworkGPU extends NeuralNetwork {}

/* CrossValidate section */
export interface ICrossValidateJSON {
  avgs: ICrossValidationTestPartitionResults;
  stats: ICrossValidateStats;
  sets: ICrossValidationTestPartitionResults[];
}

export interface ICrossValidateStats {
  truePos: number;
  trueNeg: number;
  falsePos: number;
  falseNeg: number;
  total: number;
}

export interface ICrossValidationTestPartitionResults {
  trainTime: number;
  testTime: number;
  iterations: number;
  trainError: number;
  learningRate: number;
  hidden: number[];
  network: NeuralNetwork;
}

export class CrossValidate {
  public constructor(Classifier: typeof NeuralNetwork, options?: INeuralNetworkOptions);
  public fromJSON(json: ICrossValidateJSON): NeuralNetwork;
  public toJSON(): ICrossValidateJSON;
  public train(
    data: INeuralNetworkTrainingData[],
    trainingOptions: INeuralNetworkTrainingOptions,
    k?: number): ICrossValidateStats;
  public train<T>(
    data: T,
    trainingOptions: INeuralNetworkTrainingOptions,
    k?: number): ICrossValidateStats;
  public testPartition(): ICrossValidationTestPartitionResults;
  public toNeuralNetwork(): NeuralNetwork;
  public toNeuralNetwork<T>(): T;
}

/* TrainStream section */
export interface ITrainStreamOptions {
  neuralNetwork: NeuralNetwork,
  neuralNetworkGPU: NeuralNetworkGPU,
  floodCallback: () => void,
  doneTrainingCallback: (state: INeuralNetworkState) => void
}

export class TrainStream {
  public constructor(options: ITrainStreamOptions)
  write(data: INeuralNetworkTrainingData): void;
  write<T>(data: T): void;
  endInputs(): void;
}

/* recurrent section */
export type RNNTrainingValue = string;
export interface IRNNTrainingData {
  input: RNNTrainingValue,
  output: RNNTrainingValue
}
export interface IRNNDefaultOptions extends INeuralNetworkOptions {
  decayRate?: number;
  inputRange?: number;
  inputSize?: number;
  learningRate?: number;
  outputSize?: number;
}

/* recurrent time step section */
export type RNNTimeStepInput = number[] | number[][] | object | object[] | object[][];
export type IRNNTimeStepTrainingDatum =
  IRNNTimeStepTrainingNumbers
  | IRNNTimeStepTrainingNumbers2D
  | IRNNTimeStepTrainingObject
  | IRNNTimeStepTrainingObjects
  | IRNNTimeStepTrainingObject2D
  | number[]
  | number[][]
  | object[]
  | object[][];

export interface IRNNTimeStepTrainingNumbers {
  input: number[],
  output: number[]
}

export interface IRNNTimeStepTrainingNumbers2D {
  input: number[][],
  output: number[][]
}

export interface IRNNTimeStepTrainingObject {
  input: object,
  output: object
}

export interface IRNNTimeStepTrainingObjects {
  input: object[],
  output: object[]
}

export interface IRNNTimeStepTrainingObject2D {
  input: object[][],
  output: object[][]
}

export class NeuralNetworkGPU extends NeuralNetwork {

}

export declare namespace recurrent {
  class RNN extends NeuralNetwork {
    constructor(options?: IRNNDefaultOptions)
    run(data: RNNTrainingValue): RNNTrainingValue;
    run<T>(data: RNNTrainingValue): T;
    run<TInput, TOutput>(data: TInput): TOutput;
    train(data: IRNNTrainingData[], options: INeuralNetworkTrainingOptions): INeuralNetworkState;
    train<T>(data: T, options: INeuralNetworkTrainingOptions): INeuralNetworkState;
  }
  class LSTM extends recurrent.RNN {}
  class GRU extends recurrent.RNN {}

  class RNNTimeStep extends recurrent.RNN {
    run(input: RNNTimeStepInput): RNNTimeStepInput;
    run<T>(input: RNNTimeStepInput): T;
    run<TInput, TOutput>(input: TInput): TOutput;

    forecast(input: RNNTimeStepInput, count: number): RNNTimeStepInput;
    forecast<T>(input: RNNTimeStepInput, count: number): T;
    forecast<TInput, TOutput>(input: TInput, count: number): TOutput;

    train(data: IRNNTimeStepTrainingDatum[], options: INeuralNetworkTrainingOptions): INeuralNetworkState;
    train<T>(data: T, options: INeuralNetworkTrainingOptions): INeuralNetworkState;
  }
  class LSTMTimeStep extends recurrent.RNNTimeStep {}
  class GRUTimeStep extends recurrent.RNNTimeStep {}
}

/* misc helper function section */
export function likely<T>(input: T, net: NeuralNetwork): any;

export class FeedForward {
  constructor(options?: IFeedForwardOptions);
}

export interface IFeedForwardOptions {
  learningRate?: number;
  binaryThresh?: number;
  hiddenLayers?: any;
  inputLayer?: any;
  outputLayer?: any;
  praxisOpts?: object;
  praxis?: any;
}

/* NeuralNetwork section */
export interface INeuralNetworkOptions {
  binaryThresh?: number;
  hiddenLayers?: number[];
  activation?: NeuralNetworkActivation;
  leakyReluAlpha?: number;
}

export type NeuralNetworkActivation = 'sigmoid' | 'relu' | 'leaky-relu' | 'tanh';

export interface INeuralNetworkTrainingOptions {
  iterations?: number;
  errorThresh?: number;
  log?: boolean | INeuralNetworkTrainingCallback;
  logPeriod?: number;
  learningRate?: number;
  momentum?: number;
  callback?: INeuralNetworkTrainingCallback | number;
  callbackPeriod?: number;
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
  output: NeuralNetworkInput;
}

export type NeuralNetworkInput = number[];

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
  inputSize?: number;
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

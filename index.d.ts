/* NeuralNetwork section */
export interface INeuralNetworkOptions {
  binaryThresh?: number;
  hiddenLayers?: number[];
  activation?: NeuralNetworkActivation;
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
  trainOpts: INeuralNetworkTrainingOptions
}

export interface INeuralNetworkTrainingData {
  input: NeuralNetworkTrainingValue;
  output: NeuralNetworkTrainingValue;
}

export type NeuralNetworkTrainingValue = number[];

export class NeuralNetwork {
  public constructor(options?: INeuralNetworkOptions);
  public train(data: INeuralNetworkTrainingData[], options?: INeuralNetworkTrainingOptions): INeuralNetworkState;
  public train<T>(data: T, options?: INeuralNetworkTrainingOptions): INeuralNetworkState;
  public trainAsync(data: INeuralNetworkTrainingData, options?: INeuralNetworkTrainingOptions): Promise<INeuralNetworkState>;
  public trainAsync<T>(data: T, options?: INeuralNetworkTrainingOptions): Promise<INeuralNetworkState>;
  public run(data: NeuralNetworkTrainingValue): NeuralNetworkTrainingValue;
  public run<T>(data: NeuralNetworkTrainingValue): T;
  public run<TInput, TOutput>(data: TInput): TOutput;
  public fromJSON(json: INeuralNetworkJSON): NeuralNetwork;
  public toJSON(): INeuralNetworkJSON;
}

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
export type RNNTimeStepTrainingValue = NeuralNetworkTrainingValue | number | number[] | number[][];
export interface IRNNDefaultOptions extends INeuralNetworkOptions {
  inputSize?: number;
  outputSize?: number;
}
export interface IRNNTrainingData {
  input: RNNTrainingValue,
  output: RNNTrainingValue
}

export interface IRNNTimeStepTrainingData {
  input: number[],
  output: number[]
}

export interface IRNNTimeStepTrainingData2d {
  input: number[][],
  output: number[][]
}

export interface IRNNTimeStepTrainingData3d {
  input: number[][][],
  output: number[][][]
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
    run(data: RNNTimeStepTrainingValue): RNNTimeStepTrainingValue;
    run<T>(data: RNNTimeStepTrainingValue): T;
    run<TInput, TOutput>(data: TInput): TOutput;
    train(data: IRNNTimeStepTrainingData[] | IRNNTimeStepTrainingData2d[] | IRNNTimeStepTrainingData3d[], options: INeuralNetworkTrainingOptions): INeuralNetworkState;
    train<T>(data: T, options: INeuralNetworkTrainingOptions): INeuralNetworkState;
  }
  class LSTMTimeStep extends recurrent.RNNTimeStep {}
  class GRUTimeStep extends recurrent.RNNTimeStep {}
}

/* misc helper function section */
export function likely<T>(input: T, net: NeuralNetwork): any;
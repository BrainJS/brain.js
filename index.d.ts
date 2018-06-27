export interface INeuralNetworkDefaultOptions {
  binaryThresh: number;
  hiddenLayers: number[];
  activation: NeuralNetworkActivation
}

export type NeuralNetworkActivation = 'sigmoid' | 'relu' | 'leaky-relu' | 'tanh';

export interface INeuralNetworkTrainingOptions {
  iterations?: number;
  errorThresh?: number;
  log?: boolean;
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

export interface ITrainStream {
  write<T>(data: T): void;
}

export interface ITrainStreamOptions {
  floodCallback?: () => void;
  doneTrainingCallback?: (obj: any) => void;
}

export class NeuralNetwork {
  public constructor(options?: INeuralNetworkDefaultOptions);
  public train<T>(data: T, options?: INeuralNetworkTrainingOptions): INeuralNetworkState;
  public train(data: any[], options?: INeuralNetworkTrainingOptions): INeuralNetworkState;
  public trainAsync<T>(data: T, options?: INeuralNetworkTrainingOptions): Promise<INeuralNetworkState>;
  public trainAsync(data: any, options?: INeuralNetworkTrainingOptions): Promise<INeuralNetworkState>;
  public run<T>(data: string | number | string[] | number[]): T;
  public fromJSON<T>(json: T);
  public toJSON<T>(): T;
  public createTrainStream(options: ITrainStreamOptions): ITrainStream;
}

export declare namespace recurrent {
  class LSTM extends NeuralNetwork {}
}

export function likely<T>(input: T, net: NeuralNetwork): any;
declare module brain {
  interface INeuralNetworkDefaultOptions {
    binaryThresh: number;
    hiddenLayers: number[];
    activation: NeuralNetworkActivation
  }
  type NeuralNetworkActivation = 'sigmoid' | 'relu' | 'leaky-relu' | 'tanh';
  interface INeuralNetworkTrainingOptions {
    iterations: number;
    errorThresh: number;
    log: boolean;
    logPeriod: number;
    learningRate: number;
    momentum: number;
    callback: INeuralNetworkTrainingCallback | number;
    callbackPeriod: number;
    timeout: number;
  }
  interface INeuralNetworkTrainingCallback {
    (state: INeuralNetworkState): void;
  }
  interface INeuralNetworkState {
    iterations: number;
    error: number;
  }
  class NeuralNetwork {
    public constructor(options?: INeuralNetworkDefaultOptions);
    public train<T>(data: T, options?: INeuralNetworkTrainingOptions): INeuralNetworkState;
    public train(data: any[], options?: INeuralNetworkTrainingOptions): INeuralNetworkState;
    public trainAsync<T>(data: T, options?: INeuralNetworkTrainingOptions): Promise<INeuralNetworkState>;
    public trainAsync(data: any, options?: INeuralNetworkTrainingOptions): Promise<INeuralNetworkState>;
    public run<T>(data: string[] | number[]): T;
    public fromJSON<T>(json: T);
    public toJSON<T>(): T;
  }
}
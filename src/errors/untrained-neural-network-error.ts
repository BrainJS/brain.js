interface IErrorableNeuralNetworkConstructor {
  name: string;
}

interface IErrorableNeuralNetwork {
  constructor: IErrorableNeuralNetworkConstructor;
}

export class UntrainedNeuralNetworkError extends Error {
  constructor(neuralNetwork: IErrorableNeuralNetwork) {
    super(
      `Cannot run a ${neuralNetwork.constructor.name} before it is trained.`
    );
  }
}

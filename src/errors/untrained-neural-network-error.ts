export class UntrainedNeuralNetworkError extends Error {
  constructor (
    neuralNetwork: any
  ) {
    super(`Cannot run a ${neuralNetwork.constructor.name} before it is trained.`);
  }
}

export class UntrainedNeuralNetworkError extends Error {
  constructor (
    neuralNetwork: object
  ) {
    super(`Cannot run a ${neuralNetwork.constructor.name} before it is trained.`);
  }
}

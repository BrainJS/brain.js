export class UntrainedNeuralNetworkError<
  T extends { constructor: { name: string } }
> extends Error {
  constructor(neuralNetwork: T) {
    super(
      `Cannot run a ${neuralNetwork.constructor.name} before it is trained.`
    );
  }
}

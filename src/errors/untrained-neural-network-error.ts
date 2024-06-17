import { NeuralNetwork } from "../neural-network";

interface IErrorableNeuralNetwork {
  constructor: Function;
}

export class UntrainedNeuralNetworkError extends Error {
  constructor (
    neuralNetwork: IErrorableNeuralNetwork
  ) {
    super(`Cannot run a ${neuralNetwork.constructor.name} before it is trained.`);
  }
}

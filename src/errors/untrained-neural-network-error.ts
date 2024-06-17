import { NeuralNetwork, NeuralNetworkIO } from "../neural-network";

export class UntrainedNeuralNetworkError<NeuralNetworkType extends NeuralNetwork<NeuralNetworkIO, NeuralNetworkIO>> extends Error {
  constructor (
    neuralNetwork: object
  ) {
    super(`Cannot run a ${neuralNetwork.constructor.name} before it is trained.`);
  }
}

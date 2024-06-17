import { INeuralNetworkData, NeuralNetwork } from "../neural-network";
import { NeuralNetworkGPU } from "../neural-network-gpu";

export class UntrainedNeuralNetworkError extends Error {
  constructor (
    neuralNetwork: object
  ) {
    super(`Cannot run a ${neuralNetwork.constructor.name} before it is trained.`);
  }
}

import { IKernelFunctionThis } from "gpu.js";

export type LossFunctionInputs = number[] | number[][] | number[][][] | Float32Array | Float32Array[] | Float32Array[][];

export type NeuralNetworkMemory = Float32Array[][];

export type LossFunction = (
  this: IKernelFunctionThis,
  actual: number,
  expected: number,
  inputs: LossFunctionInputs,
  memory: NeuralNetworkMemory
) => number;

export type MemoryFunction = (
  this: IKernelFunctionThis,
  actual: number,
  expected: number,
  inputs: LossFunctionInputs,
  memory: NeuralNetworkMemory,
  memorySize: number,
  loss: number,
  lossDelta: number
) => number;

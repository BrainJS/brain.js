import { IKernelFunctionThis } from "gpu.js";

export type LossFunctionInputs = number[] | number[][] | number[][][] | Float32Array | Float32Array[] | Float32Array[][];

export type NeuralNetworkRAM = Float32Array[][];

export type LossFunction = (
  this: IKernelFunctionThis,
  actual: number,
  expected: number,
  inputs: LossFunctionInputs,
  memory: NeuralNetworkRAM
) => number;

export type RAMFunction = (
  this: IKernelFunctionThis,
  actual: number,
  expected: number,
  inputs: LossFunctionInputs,
  ram: NeuralNetworkRAM,
  ramSize: number,
  loss: number,
  lossDelta: number
) => number;

import { IKernelFunctionThis } from "gpu.js";

export type LossFunctionInputs = number[] | number[][] | number[][][] | Float32Array | Float32Array[] | Float32Array[][];

export type LossFunctionState = number[][][] | Float32Array[][];

export type LossFunction = (
  this: IKernelFunctionThis,
  actual: number,
  expected: number,
  inputs: LossFunctionInputs,
  state: LossFunctionState
) => number;

export type LossFunctionInputs = number[] | Float32Array;

export type LossFunctionState = number[][][] | Float32Array[][];

export type LossFunction = (
  actual: number,
  expected: number,
  inputs: LossFunctionInputs,
  state: LossFunctionState
) => number;

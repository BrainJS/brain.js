export type LossFunctionInputs = number[] | number[][] | number[][][] | Float32Array | Float32Array[] | Float32Array[][];

export type LossFunctionState = number[][][] | Float32Array[][];

export type LossFunction = (
  actual: number,
  expected: number,
  inputs: LossFunctionInputs,
  state: LossFunctionState
) => number;

import { Matrix } from '.';

export function softmax(matrix: Matrix): Matrix {
  // probability volume
  const result = new Matrix(matrix.rows, matrix.columns);
  let maxVal = -999999;

  for (let i = 0; i < matrix.weights.length; i++) {
    if (matrix.weights[i] > maxVal) {
      maxVal = matrix.weights[i];
    }
  }

  let s = 0;
  for (let i = 0; i < matrix.weights.length; i++) {
    result.weights[i] = Math.exp(matrix.weights[i] - maxVal);
    s += result.weights[i];
  }

  for (let i = 0; i < matrix.weights.length; i++) {
    result.weights[i] /= s;
  }

  // no backward pass here needed
  // since we will use the computed probabilities outside
  // to set gradients directly on m
  return result;
}

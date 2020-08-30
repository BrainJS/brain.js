import { zeros } from './zeros';

/**
 * Returns a 2D tensor(matrix) of zeros
 */
export function zeros2D(width: number, height: number): Float32Array[][] {
  const result = new Array(height);
  for (let y = 0; y < height; y++) {
    result[y] = zeros(width);
  }
  return result;
};

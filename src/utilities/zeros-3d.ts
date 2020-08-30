import { zeros2D } from './zeros-2d';

/**
 * Returns a 3D tensor of arrays
 */
export function zeros3D(width: number, height: number, depth: number): Float32Array[][][] {
  const result = new Array(depth);
  for (let z = 0; z < depth; z++) {
    result[z] = zeros2D(width, height);
  }
  return result;
};

import { values2D } from './values-2d';

/**
 * Returns a 3D tensor of given width, height and depth with each element equal to the given value
 */
export function values3D(
  width: number,
  height: number,
  depth: number,
  value: number
): Float32Array[][] {
  const result = new Array(depth);
  for (let z = 0; z < depth; z++) {
    result[z] = values2D(width, height, value);
  }
  return result;
}

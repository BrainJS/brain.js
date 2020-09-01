import { values } from './values';

/**
 * Returns a matrix of given width and height with each element filled with the same value
 */
export function values2D(
  width: number,
  height: number,
  value: number
): Float32Array[] {
  const result = new Array(height);
  for (let y = 0; y < height; y++) {
    result[y] = values(width, value);
  }
  return result;
}

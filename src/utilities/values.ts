/**
 * Returns an array of a given size with each element filled with a single value
 */
export function values(size: number, value: number): Float32Array {
  return new Float32Array(size).fill(value);
}

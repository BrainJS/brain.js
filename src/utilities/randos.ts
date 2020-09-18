import { randomWeight } from './random-weight';
import { randomFloat } from './random';

export function randos(
  size: number,
  std: number | undefined | null
): Float32Array {
  const array = new Float32Array(size);
  if (std) {
    for (let i = 0; i < size; i++) {
      array[i] = randomFloat(-std, std);
    }
  } else {
    for (let i = 0; i < size; i++) {
      array[i] = randomWeight();
    }
  }
  return array;
}

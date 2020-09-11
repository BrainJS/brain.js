const { randomWeight } = require('./random-weight');
const { randomFloat } = require('./random');

/**
 * Returns an array of given size, full of randomness
 */
export function randos(size: number, std: number | null): Float32Array {
  const array = new Float32Array(size);
  if (std !== null) {
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

/**
 * Returns a 2D matrix of given size, full of randomness
 */
export function randos2D(
  width: number,
  height: number,
  std: number | null = null
): Float32Array[] {
  const result = new Array(height);
  for (let y = 0; y < height; y++) {
    result[y] = randos(width, std);
  }
  return result;
}

/**
 * Returns a 3D tensor of given size, full of randomness
 */
export function randos3D(
  width: number,
  height: number,
  depth: number
): Float32Array[][] {
  const result = new Array(depth);
  for (let z = 0; z < depth; z++) {
    result[z] = randos2D(width, height);
  }
  return result;
}

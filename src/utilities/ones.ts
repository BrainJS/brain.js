export function ones(size: number): Float32Array {
  return new Float32Array(size).fill(1);
}

export function ones2D(width: number, height: number): Float32Array[] {
  const result = new Array(height);
  for (let y = 0; y < height; y++) {
    result[y] = ones(width);
  }
  return result;
}

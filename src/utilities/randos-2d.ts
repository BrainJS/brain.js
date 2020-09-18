import { randos } from './randos';

export function randos2D(
  width: number,
  height: number,
  std?: number | undefined | null
): Float32Array[] {
  const result = new Array(height);
  for (let y = 0; y < height; y++) {
    result[y] = randos(width, std);
  }
  return result;
}

import { randos2D } from './randos-2d';

export function randos3D(
  width: number,
  height: number,
  depth: number,
  std?: number
): Float32Array[][] {
  const result = new Array(depth);
  for (let z = 0; z < depth; z++) {
    result[z] = randos2D(width, height, std);
  }
  return result;
}

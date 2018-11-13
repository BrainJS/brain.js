import rondos2D from './randos-2d';

export default function randos3D(width, height, depth) {
  const result = new Array(depth);
  for (let z = 0; z < depth; z++) {
    result[z] = rondos2D(width, height);
  }
  return result;
}

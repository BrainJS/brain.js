import zeros2D from './zeros-2d';

export default function zeros3D(width, height, depth) {
  const result = new Array(depth);
  for (let z = 0; z < depth; z++) {
    result[z] = zeros2D(width, height);
  }
  return result;
}
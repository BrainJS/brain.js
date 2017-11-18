import randos from './randos';

export default function randos2d(width, height) {
  const result = new Array(height);
  for (let y = 0; y < height; y++) {
    result[y] = randos(width);
  }
  return result;
}
import randomWeight from './random-weight';

export default function randos(size) {
  let array = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    array[i] = randomWeight();
  }
  return array;
}

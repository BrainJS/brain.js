export default function ones(size) {
  if (typeof Float32Array !== 'undefined') return new Float32Array(size).fill(1);
  let array = new Array(size);
  for (let i = 0; i < size; i++) {
    array[i] = 1;
  }
  return array;
}

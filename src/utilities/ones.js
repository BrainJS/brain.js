export default function ones(size) {
  if (typeof Float64Array !== 'undefined') return new Float64Array(size).fill(1);
  let array = new Array(size);
  for (let i = 0; i < size; i++) {
    array[i] = i;
  }
  return array;
}

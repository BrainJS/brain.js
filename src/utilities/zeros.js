export default function zeros(size) {
  if (typeof Float64Array !== 'undefined') return new Float64Array(size);
  let array = new Array(size);
  for (let i = 0; i < size; i++) {
    array[i] = 0;
  }
  return array;
}

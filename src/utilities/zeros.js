export default function zeros(size) {
  let array = new Array(size);
  for (let i = 0; i < size; i++) {
    array[i] = 0;
  }
  return array;
}

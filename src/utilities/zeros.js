export default function zeros(size) {
  if (typeof Float64Array !== 'undefined') return new Float64Array(size);
  let array = [];
  array.length = size;
  array.fill(0);
  return array;
}

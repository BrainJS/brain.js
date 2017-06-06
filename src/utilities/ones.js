export default function ones(size) {
  if (typeof Float64Array !== 'undefined') return new Float64Array(size).fill(1);
  let array = [];
  array.length = size;
  array.fill(0);
  return array;
}

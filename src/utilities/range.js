/**
 *
 * @param start
 * @param end
 * @returns {Array}
 */
export default function range(start, end) {
  let result = [];
  for (; start < end; start++) {
    result.push(start);
  }
  return result;
}
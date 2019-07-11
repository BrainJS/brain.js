/**
 *
 * @param start
 * @param end
 * @returns {Array}
 */
module.exports = function range(start, end) {
  const result = [];
  for (; start < end; start++) {
    result.push(start);
  }
  return result;
}

/**
 *
 * @param values
 * @returns {*}
 */
module.exports = function toArray(values) {
  if (Array.isArray(values)) {
    return values;
  }
  return new Float32Array(Object.values(values));
};

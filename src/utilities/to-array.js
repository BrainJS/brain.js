/**
 *
 * @param values
 * @returns {*}
 */
export default function toArray(values) {
  if (Array.isArray(values)) {
    return values;
  } else {
    const keys = Object.keys(values);
    const result = new Float32Array(keys.length);
    for (let i in keys) {
      result[i] = values[keys[i]];
    }
    return result;
  }
}
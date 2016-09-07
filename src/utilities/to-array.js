/**
 *
 * @param values
 * @returns {*}
 */
export default function toArray(values) {
  values = values || [];
  if (values.constructor === Array) {
    return values;
  } else {
    return Object.keys(values).map(key => values[key]);
  }
}
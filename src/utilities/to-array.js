/**
 *
 * @param values
 * @returns {*}
 */
export default function toArray(values) {
  values = values || [];
  if (Array.isArray(values)) {
    return values;
  } else {
    return Object.keys(values).map(key => values[key]);
  }
}
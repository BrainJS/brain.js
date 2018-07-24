/**
 *
 * @param values
 * @returns {*}
 */
export default function toArray(values) {
  if (Array.isArray(values)) {
    return values
  }
  const keys = Object.keys(values)
  const result = new Float32Array(keys.length)

  keys.forEach(i => {
    result[i] = values[keys[i]]
  })

  return result
}

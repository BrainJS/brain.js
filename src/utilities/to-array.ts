/**
 *
 * @param values
 * @returns {*}
 */
export function toArray(
  values: Record<string, number> | number[]
): number[] | Float32Array {
  if (Array.isArray(values)) {
    return values;
  }
  return new Float32Array(Object.values(values));
}

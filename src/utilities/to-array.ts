/**
 *
 * @param values
 * @returns {*}
 */
export function toArray(
  values: number[] | Float32Array | { [key: string]: number | string | boolean }
): number[] | Float32Array {
  if (Array.isArray(values)) {
    return values;
  }

  return new Float32Array(Object.values(values));
}

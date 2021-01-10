export function toArray(
  values: number[] | Float32Array | { [key: string]: number }
): Float32Array {
  if (Array.isArray(values)) {
    return Float32Array.from(values);
  }

  return Float32Array.from(Object.values(values));
}

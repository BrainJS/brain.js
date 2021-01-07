export function toArray(
  values: number[] | Float32Array | { [key: string]: number }
): number[] {
  if (Array.isArray(values)) {
    return values;
  }

  return Object.values(values);
}

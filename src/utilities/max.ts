export function max(
  values:
    | Float32Array
    | {
        [key: string]: number;
      }
): number {
  if (Array.isArray(values) || values instanceof Float32Array) {
    return Math.max(...values);
  } else {
    return Math.max(...Object.values(values));
  }
}

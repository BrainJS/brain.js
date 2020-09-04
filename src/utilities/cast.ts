export function arraysToFloat32Arrays(arrays: number[][]): Float32Array[] {
  const result: Float32Array[] = [];
  for (let i = 0; i < arrays.length; i++) {
    result.push(Float32Array.from(arrays[i]));
  }
  return result;
}

export function arrayToFloat32Arrays(array: number[]): Float32Array[] {
  const result: Float32Array[] = [];
  for (let i = 0; i < array.length; i++) {
    result.push(Float32Array.from([array[i]]));
  }
  return result;
}

export function arrayToFloat32Array(array: number[]): Float32Array {
  return Float32Array.from(array);
}

export function objectsToFloat32Arrays(
  objects: Array<Record<string, number>>,
  table: Record<string, number>,
  length: number
): Float32Array[] {
  const results: Float32Array[] = [];
  for (let i = 0; i < objects.length; i++) {
    const object = objects[i];
    const result = new Float32Array(length);
    for (const p in object) {
      if (object.hasOwnProperty(p)) {
        result[table[p]] = object[p];
      }
    }
    results.push(result);
  }
  return results;
}

export function objectToFloat32Arrays(
  object: Record<string, number>
): Float32Array[] {
  const result: Float32Array[] = [];
  for (const p in object) {
    result.push(Float32Array.from([object[p]]));
  }
  return result;
}

export function objectToFloat32Array(
  object: Record<string, number>,
  table: Record<string, number>,
  length: number
): Float32Array {
  const result = new Float32Array(length);
  for (const p in object) {
    if (object.hasOwnProperty(p)) {
      result[table[p]] = object[p];
    }
  }
  return result;
}

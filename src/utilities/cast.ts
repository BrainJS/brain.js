export function arraysToFloat32Arrays(arrays: number[][]): Float32Array[] {
  const result: Float32Array[] = [];
  for (let i = 0; i < arrays.length; i++) {
    result.push(Float32Array.from(arrays[i]));
  }
  return result;
}

export function inputOutputArraysToFloat32Arrays(
  input: number[][],
  output: number[][]
): Float32Array[] {
  const result: Float32Array[] = [];
  for (let i = 0; i < input.length; i++) {
    result.push(Float32Array.from(input[i]));
  }
  for (let i = 0; i < output.length; i++) {
    result.push(Float32Array.from(output[i]));
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

export function inputOutputArrayToFloat32Arrays(
  input: number[],
  output: number[]
) {
  const result: Float32Array[] = [];
  for (let i = 0; i < input.length; i++) {
    result.push(Float32Array.from([input[i]]));
  }
  for (let i = 0; i < output.length; i++) {
    result.push(Float32Array.from([output[i]]));
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

export function inputOutputObjectsToFloat32Arrays(
  input: Array<Record<string, number>>,
  output: Array<Record<string, number>>,
  inputTable: Record<string, number>,
  outputTable: Record<string, number>,
  inputLength: number,
  outputLength: number
): Float32Array[] {
  const results: Float32Array[] = [];
  for (let i = 0; i < input.length; i++) {
    const object = input[i];
    const result = new Float32Array(inputLength);
    for (const p in object) {
      if (object.hasOwnProperty(p)) {
        result[inputTable[p]] = object[p];
      }
    }
    results.push(result);
  }
  for (let i = 0; i < output.length; i++) {
    const object = output[i];
    const result = new Float32Array(outputLength);
    for (const p in object) {
      if (object.hasOwnProperty(p)) {
        result[outputTable[p]] = object[p];
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
    if (!object.hasOwnProperty(p)) continue;
    result.push(Float32Array.from([object[p]]));
  }
  return result;
}

export function inputOutputObjectToFloat32Arrays(
  input: Record<string, number>,
  output: Record<string, number>
): Float32Array[] {
  const result: Float32Array[] = [];
  for (const p in input) {
    if (!input.hasOwnProperty(p)) continue;
    result.push(Float32Array.from([input[p]]));
  }
  for (const p in output) {
    if (!output.hasOwnProperty(p)) continue;
    result.push(Float32Array.from([output[p]]));
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

export function arraysToFloat32Arrays(arrays) {
  const result = [];
  for (let i = 0; i < arrays.length; i++) {
    result.push(Float32Array.from(arrays[i]));
  }
  return result;
}
export function arrayToFloat32Arrays(array) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(Float32Array.from([array[i]]));
  }
  return result;
}
export function arrayToFloat32Array(array) {
  return Float32Array.from(array)
}
export function objectsToFloat32Arrays(objects, lookup) {
  const results = [];
  for (let i = 0; i < objects.length; i++) {
    const object = objects[i];
    const result = new Float32Array(lookup.length);
    for (let p in object) {
      if (object.hasOwnProperty(p)) {
        result[lookup.table[p]] = object[p];
      }
    }
    results.push(result);
  }
  return results;
}
export function objectToFloat32Arrays(object) {
  const result = [];
  for (let p in object) {
    result.push(Float32Array.from([object[p]]));
  }
  return result;
}
export function objectToFloat32Array(object, lookup) {
  const result = new Float32Array(lookup.length);
  for (let p in object) {
    if (object.hasOwnProperty(p)) {
      result[lookup.table[p]] = object[p];
    }
  }
  return result;
}
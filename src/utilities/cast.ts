// TODO: update any to types

function arraysToFloat32Arrays(arrays: any[]) {
  const result = [];
  for (let i = 0; i < arrays.length; i++) {
    result.push(Float32Array.from(arrays[i]));
  }
  return result;
}
function arrayToFloat32Arrays(array: any[]) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(Float32Array.from([array[i]]));
  }
  return result;
}
function arrayToFloat32Array(array: number[]) {
  return Float32Array.from(array)
}
function objectsToFloat32Arrays(objects: { [k: string]: any }, table: { [k: string]: any }, length: number) {
  const results = [];
  for (let i = 0; i < objects.length; i++) {
    const object = objects[i];
    const result = new Float32Array(length);
    for (let p in object) {
      if (object.hasOwnProperty(p)) {
        result[table[p]] = object[p];
      }
    }
    results.push(result);
  }
  return results;
}
function objectToFloat32Arrays(object: { [x: string]: number; }) {
  const result = [];
  for (let p in object) {
    result.push(Float32Array.from([object[p]]));
  }
  return result;
}
function objectToFloat32Array(object: { [k: string]: any }, table: { [k: string]: any }, length: number) {
  const result = new Float32Array(length);
  for (let p in object) {
    if (object.hasOwnProperty(p)) {
      result[table[p]] = object[p];
    }
  }
  return result;
}

export default {
  arraysToFloat32Arrays,
  arrayToFloat32Arrays,
  arrayToFloat32Array,
  objectsToFloat32Arrays,
  objectToFloat32Arrays,
  objectToFloat32Array,
}
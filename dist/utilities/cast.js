"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arraysToFloat32Arrays = arraysToFloat32Arrays;
exports.arrayToFloat32Arrays = arrayToFloat32Arrays;
exports.arrayToFloat32Array = arrayToFloat32Array;
exports.objectsToFloat32Arrays = objectsToFloat32Arrays;
exports.objectToFloat32Arrays = objectToFloat32Arrays;
exports.objectToFloat32Array = objectToFloat32Array;
function arraysToFloat32Arrays(arrays) {
  var result = [];
  for (var i = 0; i < arrays.length; i++) {
    result.push(Float32Array.from(arrays[i]));
  }
  return result;
}
function arrayToFloat32Arrays(array) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    result.push(Float32Array.from([array[i]]));
  }
  return result;
}
function arrayToFloat32Array(array) {
  return Float32Array.from(array);
}
function objectsToFloat32Arrays(objects, table, length) {
  var results = [];
  for (var i = 0; i < objects.length; i++) {
    var object = objects[i];
    var result = new Float32Array(length);
    for (var p in object) {
      if (object.hasOwnProperty(p)) {
        result[table[p]] = object[p];
      }
    }
    results.push(result);
  }
  return results;
}
function objectToFloat32Arrays(object) {
  var result = [];
  for (var p in object) {
    result.push(Float32Array.from([object[p]]));
  }
  return result;
}
function objectToFloat32Array(object, table, length) {
  var result = new Float32Array(length);
  for (var p in object) {
    if (object.hasOwnProperty(p)) {
      result[table[p]] = object[p];
    }
  }
  return result;
}
//# sourceMappingURL=cast.js.map
const values2D = require('./values-2d');

module.exports = function values3D(width, height, depth, value) {
  const result = new Array(depth);
  for (let z = 0; z < depth; z++) {
    result[z] = values2D(width, height, value);
  }
  return result;
}

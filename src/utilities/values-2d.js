const values = require('./values');

module.exports = function values2D(width, height, value) {
  const result = new Array(height);
  for (let y = 0; y < height; y++) {
    result[y] = values(width, value);
  }
  return result;
}

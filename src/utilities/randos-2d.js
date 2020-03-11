const randos = require('./randos');

module.exports = function randos2D(width, height, std = null) {
  const result = new Array(height);
  for (let y = 0; y < height; y++) {
    result[y] = randos(width, std);
  }
  return result;
};

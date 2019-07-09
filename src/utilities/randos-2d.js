const randos = require('./randos');

module.exports = function randos2D(width, height) {
  const result = new Array(height);
  for (let y = 0; y < height; y++) {
    result[y] = randos(width);
  }
  return result;
}

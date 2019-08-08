const randomWeight = require('./random-weight');

module.exports = function randos(size) {
  const array = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    array[i] = randomWeight();
  }
  return array;
};

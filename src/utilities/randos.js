const randomWeight = require('./random-weight');
const { randomFloat } = require('./random');

module.exports = function randos(size, std) {
  const array = new Float32Array(size);
  if (std) {
    for (let i = 0; i < size; i++) {
      array[i] = randomFloat(-std, std);
    }
  } else {
    for (let i = 0; i < size; i++) {
      array[i] = randomWeight();
    }
  }
  return array;
};

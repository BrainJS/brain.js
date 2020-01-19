module.exports = function mse2d(errors) {
  // mean squared error 2d
  let sum = 0;
  for (let y = 0; y < this.constants.height; y++) {
    for (let x = 0; x < this.constants.width; x++) {
      sum += errors[y][x] ** 2;
    }
  }
  return sum / this.constants.length;
};

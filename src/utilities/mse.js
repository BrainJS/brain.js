module.exports = function mse(errors) {
  // mean squared error
  let sum = 0;
  for (let i = 0; i < errors.length; i++) {
    sum += errors[i] ** 2;
  }
  return sum / errors.length;
}

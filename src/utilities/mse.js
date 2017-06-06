export default function mse(errors) {
  // mean squared error
  let sum = 0;
  sum = errors.reduce((currentSum, next) => {
    return currentSum + Math.pow(next, 2);
  }, sum);
  return sum / errors.length;
}

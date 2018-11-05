export default function mse(errors) {
  // mean squared error
  let sum = 0;
  for (let i = 0; i < errors.length; i++) {
    sum += errors[i] * errors[i];
  }
  return sum / errors.length;
}

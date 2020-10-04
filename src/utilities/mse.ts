export function mse(errors: number[]): number {
  // mean squared error
  let sum = 0;
  for (let i = 0; i < errors.length; i++) {
    sum += errors[i] ** 2;
  }
  return sum / errors.length;
}

export default function mse2d(errors) {
  // mean squared error 2d
  let sum = 0
  const length = errors.length * errors[0].length
  for (let y = 0; y < errors.length; y++) {
    for (let x = 0; x < errors[y].length; x++) {
      sum += Math.pow(errors[y][x], 2)
    }
  }
  return sum / length
}

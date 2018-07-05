import ones from './ones'

export default function ones2D(width, height) {
  const result = new Array(height)
  for (let y = 0; y < height; y++) {
    result[y] = ones(width)
  }
  return result
}

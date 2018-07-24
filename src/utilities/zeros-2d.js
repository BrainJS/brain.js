import zeros from './zeros'

export default function zeros2D(width, height) {
  const result = new Array(height)
  for (let y = 0; y < height; y++) {
    result[y] = zeros(width)
  }
  return result
}

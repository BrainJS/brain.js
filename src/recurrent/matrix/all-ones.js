/**
 * makes matrix weights and recurrence all ones
 * @param {Matrix} m
 */
export default function allOnes(m) {
  for(let i = 0, max = m.weights.length; i < max; i++) {
    m.weights[i] = 1;
    m.recurrence[i] = 0;
  }
}

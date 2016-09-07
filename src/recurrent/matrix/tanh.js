/**
 * @param {Matrix} into
 * @param {Matrix} m
 */
export default function tanh(into, m) {
  // tanh nonlinearity
  for(let i = 0, max = m.weights.length; i < max; i++) {
    into.weights[i] = Math.tanh(m.weights[i]);
    into.recurrence[i] = 0;
  }
}

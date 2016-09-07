/**
 *
 * relu {m} weights to {into} weights
 * @param {Matrix} into
 * @param {Matrix} m
 */
export default function relu(into, m) {
  for(let i = 0, max = m.weights.length; i < max; i++) {
    into.weights[i] = Math.max(0, m.weights[i]); // relu
    into.recurrence[i] = 0;
  }
}

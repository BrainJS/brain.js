/**
 * add {left} and {right} matrix weights into {into}
 * @param {Matrix} into
 * @param {Matrix} left
 * @param {Matrix} right
 */
export default function add(into, left, right) {
  for(let i = 0, max = left.weights.length; i < max; i++) {
    into.weights[i] = left.weights[i] + right.weights[i];
    into.recurrence[i] = 0;
  }
}

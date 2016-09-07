/**
 * adds {from} recurrence to {left} and {right} recurrence
 * @param {Matrix} from
 * @param {Matrix} left
 * @param {Matrix} right
 */
export default function addB(from, left, right) {
  for(let i = 0, max = left.weights.length; i < max; i++) {
    left.recurrence[i] += from.recurrence[i];
    right.recurrence[i] += from.recurrence[i];
  }
}

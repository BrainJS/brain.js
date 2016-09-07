/**
 *
 * @param {Matrix} from
 * @param {Matrix} m
 */
export default function sigmoidB(from, m) {
  for(let i = 0, max = m.weights.length; i < max; i++) {
    let mwi = from.weights[i];
    m.recurrence[i] += mwi * (1 - mwi) * from.recurrence[i];
  }
}

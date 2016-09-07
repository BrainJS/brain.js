/**
 *
 * @param {Matrix} from
 * @param {Matrix} m
 */
export default function tanhB(from, m) {
  for(let i = 0, max = m.weights.length; i < max; i++) {
    // grad for z = tanh(x) is (1 - z^2)
    let mwi = from.weights[i];
    m.recurrence[i] += (1.0 - mwi * mwi) * from.recurrence[i];
  }
}

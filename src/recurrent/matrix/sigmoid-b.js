/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
export default function sigmoidB(product, left) {
  for(let i = 0, max = product.recurrence.length; i < max; i++) {
    let mwi = product.weights[i];
    left.recurrence[i] += mwi * (1 - mwi) * product.recurrence[i];
  }
}

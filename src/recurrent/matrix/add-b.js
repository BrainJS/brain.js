/**
 * adds {from} recurrence to {left} and {right} recurrence
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
export default function addB(product, left, right) {
  for(let i = 0; i < product.recurrence.length; i++) {
    left.recurrence[i] = product.recurrence[i];
    right.recurrence[i] = product.recurrence[i];
  }
}

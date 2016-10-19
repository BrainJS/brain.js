/**
 * adds {from} recurrence to {m} recurrence when {m} weights are above other a threshold of 0
 * @param {Matrix} product
 * @param {Matrix} m
 */
export default function reluB(product, left) {
  for(let i = 0, max = product.recurrence.length; i < max; i++) {
    left.recurrence[i] += left.weights[i] > 0 ? product.recurrence[i] : 0;
  }
}

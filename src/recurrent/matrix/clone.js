import Matrix from '.'

/**
 *
 * @param {Matrix} product
 */
export default function clone(product) {
  const cloned = new Matrix()
  cloned.rows = parseInt(product.rows, 10)
  cloned.columns = parseInt(product.columns, 10)
  cloned.weights = product.weights.slice(0)
  cloned.deltas = product.deltas.slice(0)
  return cloned
}

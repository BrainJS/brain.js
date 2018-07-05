import Matrix from '.'

/**
 *
 * @param {Matrix} product
 */
export default function clone(product) {
  const cloned = new Matrix()
  cloned.rows = parseInt(product.rows)
  cloned.columns = parseInt(product.columns)
  cloned.weights = product.weights.slice(0)
  cloned.deltas = product.deltas.slice(0)
  return cloned
}

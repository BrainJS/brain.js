import { Matrix } from '.';

/**
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Number} rowPluckIndex
 */
export function rowPluck(
  product: Matrix,
  left: Matrix,
  rowPluckIndex: number
): void {
  const { columns } = left;
  const rowBase = columns * rowPluckIndex;

  for (let column = 0; column < columns; column++) {
    product.weights[column] = left.weights[rowBase + column];
    product.deltas[column] = 0;
  }
}

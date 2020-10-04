import { Matrix } from '.';

/**
 * adds {from} deltas into {m} deltas
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Number} rowIndex
 */
export function rowPluckB(
  product: Matrix,
  left: Matrix,
  rowIndex: number
): void {
  const { columns } = left;
  const rowBase = columns * rowIndex;

  for (let column = 0; column < columns; column++) {
    left.deltas[rowBase + column] = product.deltas[column];
  }
}

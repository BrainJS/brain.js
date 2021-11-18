import { Matrix } from '.';

/**
 * adds {from} deltas into {m} deltas
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

/**
 *
 * @param start
 * @param end
 * @returns {Array}
 */
export function range(start: number, end: number): number[] {
  const result: number[] = [];
  for (; start < end; start++) {
    result.push(start);
  }
  return result;
}

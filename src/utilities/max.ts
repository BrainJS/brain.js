import { toArray } from './to-array';

/**
 *
 * @param values
 * @returns {number}
 */
export function max(values: Record<string, number> | number[]): number {
  return Math.max(...toArray(values));
}

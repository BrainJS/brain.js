import toArray from './to-array';
/**
 *
 * @param values
 * @returns {number}
 */
export default function max(values) {
  return Math.max.apply(Math, toArray(values));
}
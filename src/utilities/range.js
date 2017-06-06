/**
 *
 * @param start
 * @param end
 * @returns {Array}
 */
export default function range(start, end) {
  let result = [...Array(end).keys()].filter((element) => {
    return element >= start
  });
  return result;
}
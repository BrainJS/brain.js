const NeuralNetwork = require('../src/neural-network');
const likely = require('../src/likely');

/**
 * Return 0 or 1 for '#'
 * @param character
 * @returns {number}
 */
function integer(character) {
  if (character === '#') return 1;
  return 0;
}

/**
 * Turn the # into 1s and . into 0s. for whole string
 * @param string
 * @returns {Array}
 */
function character(string) {
  return string.trim().split('').map(integer);
}

describe('likely', () => {
  const a = character(
    '.#####.' +
      '#.....#' +
      '#.....#' +
      '#######' +
      '#.....#' +
      '#.....#' +
      '#.....#'
  );
  const b = character(
    '######.' +
      '#.....#' +
      '#.....#' +
      '######.' +
      '#.....#' +
      '#.....#' +
      '######.'
  );
  const c = character(
    '#######' +
      '#......' +
      '#......' +
      '#......' +
      '#......' +
      '#......' +
      '#######'
  );

  /**
   * Learn the letters A through C.
   */

  const net = new NeuralNetwork();
  net.train([
    { input: a, output: { a: 1 } },
    { input: b, output: { b: 1 } },
    { input: c, output: { c: 1 } },
  ]);

  it('should be able to find a "a"', () => {
    /**
     * Predict the letter A, even with a pixel off.
     */
    const result = likely(
      character(
        '.#####.' +
          '#.....#' +
          '#.....#' +
          '###.###' +
          '#.....#' +
          '#.....#' +
          '#.....#'
      ),
      net
    );

    expect(result).toBe('a');
  });

  it('should be able to find a "b"', () => {
    /**
     * Predict the letter B, even with a pixel off.
     */
    const result = likely(
      character(
        '######.' +
          '#.....#' +
          '#.....#' +
          '######.' +
          '#..#..#' +
          '#.....#' +
          '###.##.'
      ),
      net
    );

    expect(result).toBe('b');
  });

  it('should be able to find a "c"', () => {
    /**
     * Predict the letter C, even with a pixel off.
     */

    const result = likely(
      character(
        '#######' +
          '#......' +
          '#......' +
          '#......' +
          '#......' +
          '##.....' +
          '#######'
      ),
      net
    );

    expect(result).toBe('c');
  });
});

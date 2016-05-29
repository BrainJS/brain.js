var brain = require('../../lib/brain');
var assert = require('assert');

describe('likely', function() {
  var a = character(
    '.#####.' +
    '#.....#' +
    '#.....#' +
    '#######' +
    '#.....#' +
    '#.....#' +
    '#.....#'
  );
  var b = character(
    '######.' +
    '#.....#' +
    '#.....#' +
    '######.' +
    '#.....#' +
    '#.....#' +
    '######.'
  );
  var c = character(
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
  var net = new brain.NeuralNetwork();
  net.train([
    { input: a, output: { a: 1 } },
    { input: b, output: { b: 1 } },
    { input: c, output: { c: 1 } }
  ]);

  it('should be able to find a "a"', function() {
    /**
     * Predict the letter A, even with a pixel off.
     */
    var result = brain.likely(character(
      '.#####.' +
      '#.....#' +
      '#.....#' +
      '###.###' +
      '#.....#' +
      '#.....#' +
      '#.....#'
    ), net);

    assert.ok(result === 'a');
  });

  it('should be able to find a "b"', function() {
    /**
     * Predict the letter B, even with a pixel off.
     */
    var result = brain.likely(character(
      '######.' +
      '#.....#' +
      '#.....#' +
      '######.' +
      '#..#..#' +
      '#.....#' +
      '###.##.'
    ), net);

    assert.ok(result === 'b');
  });

  it('should be able to find a "c"', function() {
    /**
     * Predict the letter C, even with a pixel off.
     */
    var result = brain.likely(character(
      '#######' +
      '#......' +
      '#......' +
      '#......' +
      '#......' +
      '##.....' +
      '#######'
    ), net);

    assert.ok(result === 'c');
  });
});

/**
 * Turn the # into 1s and . into 0s. for whole string
 * @param string
 * @returns {Array}
 */
function character(string) {
  return string
    .trim()
    .split('')
    .map(integer);
}

/**
 * Return 0 or 1 for '#'
 * @param character
 * @returns {number}
 */
function integer(character) {
  if ('#' === character) return 1;
  return 0;
}
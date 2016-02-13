var brain = require('../../lib/brain');
var assert = require('assert');

describe('likely', function() {
  it('should be able to find a "c"', function() {
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

    /**
     * Predict the letter C, even with a pixel off.
     */
    var result = net.likely(character(
        '#######' +
        '#......' +
        '#......' +
        '#......' +
        '#......' +
        '##.....' +
        '#######'
    ));

    assert.ok(result === 'c');

    /**
     * Turn the # into 1s and . into 0s.
     */
    function character(string) {
      return string
          .trim()
          .split('')
          .map(integer);

      function integer(symbol) {
        if ('#' === symbol) return 1;
        if ('.' === symbol) return 0;
      }
    }
  });
});
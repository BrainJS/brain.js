import assert from 'assert';
import * as brain from '../../src';

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
const net = new brain.NeuralNetwork();
net.train([
  { input: a, output: { a: 1 } },
  { input: b, output: { b: 1 } },
  { input: c, output: { c: 1 } },
]);

/**
 * Predict the letter A, even with a pixel off.
 */
const result = brain.likely(
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

assert(result === 'a');
console.log(result); // 'a'

/**
 * Turn the # into 1s and . into 0s. for whole string
 * @param string
 * @returns {Array}
 */
function character(string: string): number[] {
  return string.trim().split('').map(integer);
}

/**
 * Return 0 or 1 for '#'
 * @param character
 * @returns {number}
 */
function integer(character: string): number {
  if (character === '#') return 1;
  return 0;
}

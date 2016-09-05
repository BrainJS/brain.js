'use strict';

var zeros = require('./../zeros');
var random = require('../random');

/**
 * A matrix
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @constructor
 */
function Matrix(rows, columns) {
  if (typeof rows === 'undefined') return;
  if (typeof columns === 'undefined') return;

  this.rows = rows;
  this.columns = columns;
  this.weights = zeros(rows * columns);
  this.recurrence = zeros(rows * columns);
}

Matrix.prototype = {
  /**
   *
   * @param {Number} row
   * @param {Number} col
   * @returns {Float64Array|Array}
   */
  getWeights: function(row, col) {
    // slow but careful accessor function
    // we want row-major order
    var ix = (this.columns * row) + col;
    if (ix < 0 && ix >= this.weights.length) throw new Error('get accessor is skewed');
    return this.weights[ix];
  },
  /**
   * 
   * @param {Number} row
   * @param {Number} col
   * @param v
   * @returns {Matrix}
   */
  setWeights: function(row, col, v) {
    // slow but careful accessor function
    var ix = (this.columns * row) + col;
    if (ix < 0 && ix >= this.weights.length) throw new Error('set accessor is skewed');
    this.weights[ix] = v;
    return this;
  },

  /**
   * 
   * @returns {{rows: *, columns: *, weights: Array}}
   */
  toJSON: function() {
    return {
      rows: this.rows,
      columns: this.columns,
      weights: this.weights.slice(0)
    };
  }
};

Matrix.fromJSON = function(json) {
  var matrix = new Matrix(json.rows, json.columns);
  for(var i = 0, max = json.rows * json.columns; i < max; i++) {
    matrix.weights[i] = json.weights[i]; // copy over weights
  }
  return matrix;
};

module.exports = Matrix;

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _zeros = require('../../utilities/zeros');

var _zeros2 = _interopRequireDefault(_zeros);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A matrix
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @constructor
 */
var Matrix = function () {
  function Matrix(rows, columns) {
    _classCallCheck(this, Matrix);

    if (rows === undefined) return;
    if (columns === undefined) return;

    this.rows = rows;
    this.columns = columns;
    this.weights = (0, _zeros2.default)(rows * columns);
    this.deltas = (0, _zeros2.default)(rows * columns);
  }

  /**
   *
   * @param {Number} row
   * @param {Number} col
   * @returns {Float32Array|Array}
   */


  _createClass(Matrix, [{
    key: 'getWeights',
    value: function getWeights(row, col) {
      // slow but careful accessor function
      // we want row-major order
      var ix = this.columns * row + col;
      if (ix < 0 && ix >= this.weights.length) throw new Error('get accessor is skewed');
      return this.weights[ix];
    }

    /**
     *
     * @param {Number} row
     * @param {Number} col
     * @param v
     * @returns {Matrix}
     */

  }, {
    key: 'setWeight',
    value: function setWeight(row, col, v) {
      // slow but careful accessor function
      var ix = this.columns * row + col;
      if (ix < 0 && ix >= this.weights.length) throw new Error('set accessor is skewed');
      this.weights[ix] = v;
    }

    /**
     *
     * @param {Number} row
     * @param {Number} col
     * @param v
     * @returns {Matrix}
     */

  }, {
    key: 'setDeltas',
    value: function setDeltas(row, col, v) {
      // slow but careful accessor function
      var ix = this.columns * row + col;
      if (ix < 0 && ix >= this.weights.length) throw new Error('set accessor is skewed');
      this.deltas[ix] = v;
    }

    /**
     *
     * @returns {{rows: *, columns: *, weights: Array}}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      return {
        rows: this.rows,
        columns: this.columns,
        weights: this.weights.slice(0)
      };
    }
  }, {
    key: 'weightsToArray',
    value: function weightsToArray() {
      var deltas = [];
      var row = 0;
      var column = 0;
      for (var i = 0; i < this.weights.length; i++) {
        if (column === 0) {
          deltas.push([]);
        }
        deltas[row].push(this.weights[i]);
        column++;
        if (column >= this.columns) {
          column = 0;
          row++;
        }
      }
      return deltas;
    }
  }, {
    key: 'deltasToArray',
    value: function deltasToArray() {
      var deltas = [];
      var row = 0;
      var column = 0;
      for (var i = 0; i < this.deltas.length; i++) {
        if (column === 0) {
          deltas.push([]);
        }
        deltas[row].push(this.deltas[i]);
        column++;
        if (column >= this.columns) {
          column = 0;
          row++;
        }
      }
      return deltas;
    }
  }], [{
    key: 'fromJSON',
    value: function fromJSON(json) {
      var matrix = new Matrix(json.rows, json.columns);
      for (var i = 0, max = json.rows * json.columns; i < max; i++) {
        matrix.weights[i] = json.weights[i]; // copy over weights
      }
      return matrix;
    }

    /**
     *
     * @param weightRows
     * @param [deltasRows]
     * @returns {Matrix}
     */

  }, {
    key: 'fromArray',
    value: function fromArray(weightRows, deltasRows) {
      var rows = weightRows.length;
      var columns = weightRows[0].length;
      var m = new Matrix(rows, columns);

      deltasRows = deltasRows || weightRows;

      for (var rowIndex = 0; rowIndex < rows; rowIndex++) {
        var weightValues = weightRows[rowIndex];
        var deltasValues = deltasRows[rowIndex];
        for (var columnIndex = 0; columnIndex < columns; columnIndex++) {
          m.setWeight(rowIndex, columnIndex, weightValues[columnIndex]);
          m.setDeltas(rowIndex, columnIndex, deltasValues[columnIndex]);
        }
      }

      return m;
    }
  }]);

  return Matrix;
}();

exports.default = Matrix;
//# sourceMappingURL=index.js.map
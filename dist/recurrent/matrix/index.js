'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _zeros = require('../../utilities/zeros');

var _zeros2 = _interopRequireDefault(_zeros);

var _random = require('../random');

var _random2 = _interopRequireDefault(_random);

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

    if (typeof rows === 'undefined') return;
    if (typeof columns === 'undefined') return;

    this.rows = rows;
    this.columns = columns;
    this.weights = (0, _zeros2.default)(rows * columns);
    this.recurrence = (0, _zeros2.default)(rows * columns);
  }

  /**
   *
   * @param {Number} row
   * @param {Number} col
   * @returns {Float64Array|Array}
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
    key: 'setWeights',
    value: function setWeights(row, col, v) {
      // slow but careful accessor function
      var ix = this.columns * row + col;
      if (ix < 0 && ix >= this.weights.length) throw new Error('set accessor is skewed');
      this.weights[ix] = v;
      return this;
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
  }], [{
    key: 'fromJSON',
    value: function fromJSON(json) {
      var matrix = new Matrix(json.rows, json.columns);
      for (var i = 0, max = json.rows * json.columns; i < max; i++) {
        matrix.weights[i] = json.weights[i]; // copy over weights
      }
      return matrix;
    }
  }]);

  return Matrix;
}();

exports.default = Matrix;
//# sourceMappingURL=index.js.map
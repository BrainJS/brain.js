'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _random = require('../random');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** return Matrix but filled with random numbers from gaussian
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @param std
 * @constructor
 */
var RandomMatrix = function () {
  function RandomMatrix(rows, columns, std) {
    _classCallCheck(this, RandomMatrix);

    this.rows = rows;
    this.columns = columns;
    this.std = std;
    this.weights = [];
    this.recurrence = [];
    this.fill();
  }

  // fill matrix with random gaussian numbers


  _createClass(RandomMatrix, [{
    key: 'fill',
    value: function fill() {
      if (!this.std) return;
      for (var i = 0, max = this.weights.length; i < max; i++) {
        this.weights[i] = (0, _random.randomF)(-this.std, this.std);
        this.recurrence[i] = (0, _random.randomF)(-this.std, this.std);
      }
    }
  }]);

  return RandomMatrix;
}();

exports.default = RandomMatrix;
//# sourceMappingURL=random-matrix.js.map

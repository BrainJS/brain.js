'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ones = require('../../utilities/ones');

var _ones2 = _interopRequireDefault(_ones);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** return Matrix but filled with random numbers from gaussian
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @constructor
 */
var OnesMatrix = function () {
  function OnesMatrix(rows, columns) {
    _classCallCheck(this, OnesMatrix);

    this.rows = rows;
    this.columns = columns;
    this.weights = (0, _ones2.default)(rows * columns);
    this.recurrence = (0, _ones2.default)(rows * columns);
  }

  _createClass(OnesMatrix, [{
    key: 'fill',
    value: function fill() {
      this.weights = (0, _ones2.default)(this.rows * this.columns);
      this.recurrence = (0, _ones2.default)(this.rows * this.columns);
    }
  }]);

  return OnesMatrix;
}();

exports.default = OnesMatrix;
//# sourceMappingURL=ones-matrix.js.map

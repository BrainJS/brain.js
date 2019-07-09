'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Matrix = require('.');
var ones = require('../../utilities/ones');

/** return Matrix but filled with random numbers from gaussian
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @constructor
 */

var OnesMatrix = function (_Matrix) {
  _inherits(OnesMatrix, _Matrix);

  function OnesMatrix(rows, columns) {
    _classCallCheck(this, OnesMatrix);

    var _this = _possibleConstructorReturn(this, (OnesMatrix.__proto__ || Object.getPrototypeOf(OnesMatrix)).call(this, rows, columns));

    _this.rows = rows;
    _this.columns = columns;
    _this.weights = ones(rows * columns);
    _this.deltas = ones(rows * columns);
    return _this;
  }

  return OnesMatrix;
}(Matrix);

module.exports = OnesMatrix;
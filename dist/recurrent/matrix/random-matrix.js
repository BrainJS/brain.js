'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _random = require('../../utilities/random');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** return Matrix but filled with random numbers from gaussian
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @param std
 * @constructor
 */
var RandomMatrix = function (_Matrix) {
  _inherits(RandomMatrix, _Matrix);

  function RandomMatrix(rows, columns, std) {
    _classCallCheck(this, RandomMatrix);

    var _this = _possibleConstructorReturn(this, (RandomMatrix.__proto__ || Object.getPrototypeOf(RandomMatrix)).call(this, rows, columns));

    _this.rows = rows;
    _this.columns = columns;
    _this.std = std;
    for (var i = 0, max = _this.weights.length; i < max; i++) {
      _this.weights[i] = (0, _random.randomF)(-std, std);
    }
    return _this;
  }

  return RandomMatrix;
}(_2.default);

exports.default = RandomMatrix;
//# sourceMappingURL=random-matrix.js.map
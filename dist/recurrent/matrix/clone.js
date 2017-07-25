'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = clone;

var _ = require('./');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @param {Matrix} product
 */
function clone(product) {
  var cloned = new _2.default();
  cloned.rows = parseInt(product.rows);
  cloned.columns = parseInt(product.columns);
  cloned.weights = product.weights.slice(0);
  cloned.deltas = product.deltas.slice(0);
  return cloned;
}
//# sourceMappingURL=clone.js.map
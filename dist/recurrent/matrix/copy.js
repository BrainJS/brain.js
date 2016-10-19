'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = copy;

var _zeros = require('../../utilities/zeros');

var _zeros2 = _interopRequireDefault(_zeros);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
function copy(product, left) {
  product.rows = parseInt(left.rows);
  product.columns = parseInt(left.columns);
  //product.weights = left.weights.slice(0);
  product.recurrence = left.recurrence.slice(0);
  //TODO: needed?
  //product.recurrence = zeros(left.recurrence.length);
}
//# sourceMappingURL=copy.js.map
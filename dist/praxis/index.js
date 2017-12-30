'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mRmsProp = exports.MRmsProp = exports.momentumRootMeanSquaredPropagation = exports.MomentumRootMeanSquaredPropagation = undefined;

var _momentumRootMeanSquaredPropagation = require('./momentum-root-mean-squared-propagation');

var _momentumRootMeanSquaredPropagation2 = _interopRequireDefault(_momentumRootMeanSquaredPropagation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function momentumRootMeanSquaredPropagation(layer, settings) {
  return new _momentumRootMeanSquaredPropagation2.default(layer, settings);
}

var mRmsProp = momentumRootMeanSquaredPropagation;
exports.MomentumRootMeanSquaredPropagation = _momentumRootMeanSquaredPropagation2.default;
exports.momentumRootMeanSquaredPropagation = momentumRootMeanSquaredPropagation;
exports.MRmsProp = _momentumRootMeanSquaredPropagation.MRmsProp;
exports.mRmsProp = mRmsProp;
//# sourceMappingURL=index.js.map
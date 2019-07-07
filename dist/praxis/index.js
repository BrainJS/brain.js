'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _momentumRootMeanSquaredPropagation = require('./momentum-root-mean-squared-propagation');

var _momentumRootMeanSquaredPropagation2 = _interopRequireDefault(_momentumRootMeanSquaredPropagation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function momentumRootMeanSquaredPropagation(layer, settings) {
  return new _momentumRootMeanSquaredPropagation2.default(layer, settings);
}

var mRmsProp = momentumRootMeanSquaredPropagation;
exports.default = {
  MomentumRootMeanSquaredPropagation: _momentumRootMeanSquaredPropagation2.default,
  momentumRootMeanSquaredPropagation: momentumRootMeanSquaredPropagation,
  MRmsProp: _momentumRootMeanSquaredPropagation.MRmsProp,
  mRmsProp: mRmsProp
};
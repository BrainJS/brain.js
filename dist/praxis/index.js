'use strict';

var mrmsp = require('./momentum-root-mean-squared-propagation');
var MomentumRootMeanSquaredPropagation = mrmsp.MomentumRootMeanSquaredPropagation;
var MRmsProp = mrmsp.MRmsProp;

function momentumRootMeanSquaredPropagation(layer, settings) {
  return new MomentumRootMeanSquaredPropagation(layer, settings);
}

var mRmsProp = momentumRootMeanSquaredPropagation;
module.exports = {
  MomentumRootMeanSquaredPropagation: MomentumRootMeanSquaredPropagation,
  momentumRootMeanSquaredPropagation: momentumRootMeanSquaredPropagation,
  MRmsProp: MRmsProp,
  mRmsProp: mRmsProp
};
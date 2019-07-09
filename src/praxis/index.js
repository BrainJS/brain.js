const mrmsp = require('./momentum-root-mean-squared-propagation');
const MomentumRootMeanSquaredPropagation = mrmsp.MomentumRootMeanSquaredPropagation;
const MRmsProp = mrmsp.MRmsProp;

function momentumRootMeanSquaredPropagation(layer, settings) {
  return new MomentumRootMeanSquaredPropagation(layer, settings);
}

const mRmsProp = momentumRootMeanSquaredPropagation;
module.exports = {
  MomentumRootMeanSquaredPropagation,
  momentumRootMeanSquaredPropagation,
  MRmsProp,
  mRmsProp,
};

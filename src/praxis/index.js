const { Adam, adam } = require('./adam');
const { ArthurDeviationBiases, arthurDeviationBiases } = require('./arthur-deviation-biases');
const { ArthurDeviationWeights, arthurDeviationWeights } = require('./arthur-deviation-weights');
const {
  MomentumRootMeanSquaredPropagation, momentumRootMeanSquaredPropagation,
  MRmsProp, mRmsProp
} = require('./momentum-root-mean-squared-propagation');

module.exports = {
  Adam, adam,
  ArthurDeviationBiases, arthurDeviationBiases,
  ArthurDeviationWeights, arthurDeviationWeights,
  MomentumRootMeanSquaredPropagation, momentumRootMeanSquaredPropagation,
  MRmsProp, mRmsProp,
};

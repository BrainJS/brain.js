const {
  arthurDeviationWeights,
} = require('../praxis/arthur-deviation-weights');
const { arthurDeviationBiases } = require('../praxis/arthur-deviation-biases');
const { add } = require('./add');
const { random } = require('./random');
const { multiply } = require('./multiply');
const { sigmoid } = require('./sigmoid');

function arthurFeedForward(settings, inputLayer) {
  const { height } = settings;
  function weightsPraxis(layer, settings) {
    const praxis = arthurDeviationWeights(layer, settings);
    praxis.setupKernels();
    return praxis;
  }
  function biasesPraxis(layer, settings) {
    const praxis = arthurDeviationBiases(layer, settings);
    praxis.setupKernels();
    return praxis;
  }
  const weightsLayer = random({
    name: 'weights',
    height,
    width: inputLayer.height,
    praxis: weightsPraxis,
  });

  const biasesLayer = random({
    name: 'biases',
    height,
    praxis: biasesPraxis,
  });

  const multiplyLayer = multiply(weightsLayer, inputLayer);
  const addLayer = add(multiplyLayer, biasesLayer);
  const sigmoidLayer = sigmoid(addLayer);

  weightsLayer.praxis.weightsLayer = weightsLayer;
  weightsLayer.praxis.incomingLayer = inputLayer;
  weightsLayer.praxis.deltaLayer = sigmoidLayer;
  return sigmoidLayer;
}

module.exports = {
  arthurFeedForward,
};

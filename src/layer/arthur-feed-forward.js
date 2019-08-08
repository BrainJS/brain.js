const { arthurDeviationWeights } = require('../praxis/arthur-deviation-weights');
const { arthurDeviationBiases } = require('../praxis/arthur-deviation-biases');
const { add } = require('./add');
const { random } = require('./random');
const { multiply } = require('./multiply');
const { sigmoid } = require('./sigmoid');

function noopPraxis() {
  return { run: (layer) => layer.weights };
}

function arthurFeedForward(settings, inputLayer) {
  const { height } = settings;
  function weightsPraxis(layer, settings) {
    return arthurDeviationWeights(layer, settings);
  }
  function biasesPraxis(layer, settings) {
    return arthurDeviationBiases(layer, settings);
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

  const multiplyLayer = multiply(weightsLayer, inputLayer, { praxis: noopPraxis });
  const addLayer = add(multiplyLayer, biasesLayer, { praxis: noopPraxis });
  const sigmoidLayer = sigmoid(addLayer, { praxis: noopPraxis });

  weightsLayer.praxis.weightsLayer = weightsLayer;
  weightsLayer.praxis.incomingLayer = inputLayer;
  weightsLayer.praxis.deltaLayer = sigmoidLayer;
  return sigmoidLayer;
}

module.exports = {
  arthurFeedForward
};

import {
  arthurDeviationWeights,
} from '../praxis/arthur-deviation-weights';
import { arthurDeviationBiases } from '../praxis/arthur-deviation-biases';
import { add } from './add';
import { random } from './random';
import { multiply } from './multiply';
import { sigmoid } from './sigmoid';

function arthurFeedForward(settings: { height: any; }, inputLayer: { height: any; }) {
  const { height } = settings;
  function weightsPraxis(layer: any, settings: any) {
    const praxis = arthurDeviationWeights(layer, settings);
    praxis.setupKernels();
    return praxis;
  }
  function biasesPraxis(layer: any, settings: any) {
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

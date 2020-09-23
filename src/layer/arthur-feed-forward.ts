import {
  ArthurDeviationWeights,
  arthurDeviationWeights,
  IArthurDeviationWeightsSettings,
} from '../praxis/arthur-deviation-weights';
import {
  arthurDeviationBiases,
  IArthurDeviationBiasesSettings,
} from '../praxis/arthur-deviation-biases';
import { ILayer } from './base-layer';
import { add } from './add';
import { IRandomSettings, random } from './random';
import { multiply } from './multiply';
import { Sigmoid, sigmoid } from './sigmoid';
import { IPraxis } from '../praxis/base-praxis';

export interface IArthurFeedForwardPraxisSettings
  extends IArthurDeviationBiasesSettings,
    IArthurDeviationWeightsSettings {}

export interface IArthurFeedForwardSettings extends IRandomSettings {
  initPraxis?: (
    layerTemplate: ILayer,
    settings?: IArthurFeedForwardPraxisSettings | null
  ) => IPraxis;
}

export function arthurFeedForward(
  settings: IArthurFeedForwardPraxisSettings,
  inputLayer: ILayer
): Sigmoid {
  const { height } = settings;
  function initWeightsPraxis(
    layerTemplate: ILayer,
    settings?: IArthurDeviationWeightsSettings
  ): IPraxis {
    const praxis = arthurDeviationWeights(layerTemplate, settings);
    praxis.setupKernels();
    return praxis;
  }
  function initBiasesPraxis(
    layerTemplate: ILayer,
    settings?: IArthurDeviationBiasesSettings
  ): IPraxis {
    const praxis = arthurDeviationBiases(layerTemplate, settings);
    praxis.setupKernels();
    return praxis;
  }
  const weightsLayer = random({
    name: 'weights',
    height,
    width: inputLayer.height,
    initPraxis: initWeightsPraxis,
  });

  const biasesLayer = random({
    name: 'biases',
    height,
    initPraxis: initBiasesPraxis,
  });

  const multiplyLayer = multiply(weightsLayer, inputLayer);
  const addLayer = add(multiplyLayer, biasesLayer);
  const sigmoidLayer = sigmoid(addLayer);

  const weightsPraxis = weightsLayer.praxis as ArthurDeviationWeights;
  weightsPraxis.weightsLayer = weightsLayer;
  weightsPraxis.incomingLayer = inputLayer;
  weightsPraxis.deltaLayer = sigmoidLayer;
  return sigmoidLayer;
}

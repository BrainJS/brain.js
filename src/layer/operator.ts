import { BaseLayer, ILayerSettings, ILayer } from './base-layer';
import { zeros2D } from '../utilities/zeros-2d';

export abstract class Operator extends BaseLayer {
  inputLayer1: ILayer;
  inputLayer2: ILayer;
  constructor(
    inputLayer1: ILayer,
    inputLayer2: ILayer,
    settings?: ILayerSettings
  ) {
    super(settings);
    this.inputLayer1 = inputLayer1;
    this.inputLayer2 = inputLayer2;
    this.validate();
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
    this.setupPraxis();
  }
}

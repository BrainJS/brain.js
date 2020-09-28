import { ILayerSettings } from './base-layer';

import { ones2D } from '../utilities/ones';
import { zeros2D } from '../utilities/zeros-2d';
import { Model } from './types';

export class Ones extends Model {
  constructor(settings: ILayerSettings) {
    super(settings);
    this.validate();
    this.weights = ones2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }
}

export function ones(settings: ILayerSettings): Ones {
  return new Ones(settings);
}

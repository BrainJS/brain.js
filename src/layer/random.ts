import { IPraxisSettings } from './base-layer';

import { Model } from './types';
import { randos2D } from '../utilities/randos-2d';
import { zeros2D } from '../utilities/zeros-2d';

export interface IRandomSettings extends IPraxisSettings {
  std?: number | null;
}

export const defaults: IRandomSettings = {
  std: null,
};

export class Random extends Model {
  constructor(settings: IRandomSettings) {
    super(settings);
    this.validate();

    if (!this.weights) {
      this.weights = randos2D(this.width, this.height, settings.std);
    }
    if (!this.deltas) {
      this.deltas = zeros2D(this.width, this.height);
    }
  }

  predict(): void {}

  compare(): void {}
}

export function random(settings: IRandomSettings): Random {
  return new Random(settings);
}

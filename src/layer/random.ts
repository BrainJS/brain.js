import { randos2D } from '../utilities/randos';
import { zeros2D } from '../utilities/zeros-2d';
import { baseLayerDefaultSettings, ILayer, ILayerSettings } from './base-layer';
import { Model } from './types';

export interface IRandomSettings extends ILayerSettings {
  std?: number | null;
}

export const defaults: IRandomSettings = {
  ...baseLayerDefaultSettings,
  std: null,
};

export class Random extends Model implements ILayer {
  settings: IRandomSettings;
  constructor(settings: Partial<IRandomSettings>) {
    super();
    this.settings = { ...defaults, ...settings };
    this.setupPraxis();
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

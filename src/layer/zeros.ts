import { zeros2D } from '../utilities/zeros-2d';
import { Model } from './types';
import { ILayerSettings } from './base-layer';

export class Zeros extends Model {
  constructor(settings: ILayerSettings) {
    super(settings);
    this.validate();
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }

  predict(): void {
    // throw new Error(`${this.constructor.name}-predict is not yet implemented`)
  }

  compare(): void {
    // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
  }

  // learn(): void {}
}

export function zeros(settings: ILayerSettings): Zeros {
  return new Zeros(settings);
}

import { Model } from './types';
import randos2D from '../utilities/randos-2d';
import zeros2D from '../utilities/zeros-2d';

export default class Random extends Model {
  constructor(settings) {
    super(settings);
    this.validate();
    this.weights = randos2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }

  predict() {
    // throw new Error(`${this.constructor.name}-predict is not yet implemented`)
  }

  compare() {
    // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
  }
}

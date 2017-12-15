import Base from './base';
import randos2d from '../utilities/randos-2d';
import zeros2d from '../utilities/zeros-2d';

export default class Random extends Base {
  constructor(settings) {
    super(settings);
    this.deltas = zeros2d(this.width, this.height);
    this.weights = randos2d(this.width, this.height);
  }

  setupKernels() {}
}
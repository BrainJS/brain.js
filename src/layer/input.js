import Base from './base';
import zeros2D from '../utilities/zeros-2d';

export default class Input extends Base {
  constructor(settings) {
    super(settings);
    if (this.height === 1) {
      this.predict = this.predict1D;
    }
    this.deltas = zeros2D(this.width, this.height);
  }

  setupKernels() {}

  predict(inputs) {
    this.weights = inputs;
  }

  predict1D(inputs) {
    this.weights = [inputs];
  }

  compare() {}

  learn() {}
}
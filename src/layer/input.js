import Base from './base';
import zeros2D from '../utilities/zeros-2d';

export default class Input extends Base {
  constructor(settings) {
    super(settings);
    if (this.height === 1) {
      this.predict = this.predict1D;
      this.height = this.width;
      this.width = 1;
    }
    this.deltas = zeros2D(this.width, this.height);
  }

  setupKernels() {}

  predict(inputs) {
    this.weights = inputs;
  }

  predict1D(inputs) {
    this.weights = [];
    for (let y = 0; y < inputs.length; y++) {
      this.weights.push([inputs[y]]);
    }
  }

  compare() {}

  learn() {}
}
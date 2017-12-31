import Base from './base';

export default class Input extends Base {
  constructor(settings) {
    super(settings);
    if (this.height === 1) {
      this.predict = this.predict1D;
    }
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
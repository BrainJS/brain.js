import zeros2D from '../utilities/zeros-2d';
import Base from './base';

export default class Zeros extends Base {
  constructor(settings) {
    super(settings);
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }

  predict() {}
  compare() {}
}
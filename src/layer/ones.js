import ones2D from '../utilities/ones-2d';
import zeros2D from '../utilities/zeros-2d';
import Base from './base';

export default class Ones extends Base {
  constructor(settings) {
    super(settings);
    this.validate();
    this.weights = ones2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }
}
import zeros2D from '../utilities/zeros-2d';
import Base from './base';

export default class RecurrentInput extends Base {
  setRecurrentInput(recurrentInput) {
    this.recurrentInput = recurrentInput;
  }
  validate() {
    super.validate();
    if (this.width !== this.recurrentInput.width) {
      throw new Error(`${this.constructor.name} layer width ${this.width} and ${this.recurrentInput.constructor.name} width (${this.recurrentInput.width}) are not same`);
    }

    if (this.height !== this.recurrentInput.height) {
      throw new Error(`${this.constructor.name} layer height ${this.height} and ${this.recurrentInput.constructor.name} width (${this.recurrentInput.height}) are not same`);
    }
  }
  setDimensions(width, height) {
    this.width = width;
    this.height = height;
    this.weights = new zeros2D(width, height);
    this.deltas = new zeros2D(width, height);
  }

  predict() {
    this.weights = this.recurrentInput.weights;
  }
  compare() {}
}
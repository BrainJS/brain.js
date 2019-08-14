const { Internal } = require('./types');
const { Base } = require('./base');

class RecurrentInput extends Internal {
  setRecurrentInput(recurrentInput) {
    this.recurrentInput = recurrentInput;
    this.validate();
  }

  get deltas() {
    return this.recurrentInput.deltas;
  }

  set deltas(deltas) {
    this.recurrentInput.deltas = deltas;
  }

  get weights() {
    return this.recurrentInput.weights;
  }

  set weights(weights) {
    this.recurrentInput.weights = weights;
  }

  validate() {
    Base.prototype.validate.call(this);
    if (this.width !== this.recurrentInput.width) {
      throw new Error(
        `${this.constructor.name} layer width ${this.width} and ${
          this.recurrentInput.constructor.name
        } width (${this.recurrentInput.width}) are not same`
      );
    }

    if (this.height !== this.recurrentInput.height) {
      throw new Error(
        `${this.constructor.name} layer height ${this.height} and ${
          this.recurrentInput.constructor.name
        } width (${this.recurrentInput.height}) are not same`
      );
    }
  }

  setDimensions(width, height) {
    this.width = width;
    this.height = height;
  }

  predict() {
    // throw new Error(`${this.constructor.name}-predict is not yet implemented`)
  }

  compare() {
    // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
  }

  learn() {
    // throw new Error(`${this.constructor.name}-learn is not yet implemented`)
  }

  setupKernels() {
    // throw new Error(
    //   `${this.constructor.name}-setupKernels is not yet implemented`
    // )
  }

  reuseKernels() {
    // throw new Error(
    //   `${this.constructor.name}-reuseKernels is not yet implemented`
    // )
  }
}

module.exports = {
  RecurrentInput
};

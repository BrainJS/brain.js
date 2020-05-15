const { Internal } = require('./types');
const { Base } = require('./base');
const { release } = require('../utilities/kernel');
// const zeros2D = require('../utilities/zeros-2d');

class RecurrentInput extends Internal {
  constructor(recurrentInput) {
    super();
    this.recurrentInput = recurrentInput;
    this.validate();
  }

  get width() {
    return this.recurrentInput.width;
  }

  get height() {
    return this.recurrentInput.height;
  }

  get deltas() {
    return this.recurrentInput.deltas;
  }

  set deltas(deltas) {
    const recurrentInputDeltas = this.recurrentInput.deltas;
    this.recurrentInput.deltas = deltas;
    release(recurrentInputDeltas);
  }

  get weights() {
    return this.recurrentInput.weights;
  }

  set weights(weights) {
    const recurrentInputWeights = this.recurrentInput.weights;
    this.recurrentInput.weights = weights;
    release(recurrentInputWeights);
  }

  validate() {
    Base.prototype.validate.call(this);
    if (this.width !== this.recurrentInput.width) {
      throw new Error(
        `${this.constructor.name} layer width ${this.width} and ${this.recurrentInput.constructor.name} width (${this.recurrentInput.width}) are not same`
      );
    }

    if (this.height !== this.recurrentInput.height) {
      throw new Error(
        `${this.constructor.name} layer height ${this.height} and ${this.recurrentInput.constructor.name} width (${this.recurrentInput.height}) are not same`
      );
    }
  }

  setDimensions() {
    throw new Error('should just listen');
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
  RecurrentInput,
};

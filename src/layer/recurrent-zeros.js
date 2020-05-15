const zeros2D = require('../utilities/zeros-2d');
const { Internal } = require('./types');
const { release, clear } = require('../utilities/kernel');

class RecurrentZeros extends Internal {
  setDimensions(width, height) {
    this.praxis = null;
    this.width = width;
    this.height = height;
    this.weights = zeros2D(width, height);
    this.deltas = zeros2D(width, height);
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

  predict() {
    // throw new Error(`${this.constructor.name}-predict is not yet implemented`)
  }

  compare() {
    // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
  }

  learn(previousLayer, nextLayer, learningRate) {
    const { weights: oldWeights } = this;
    this.weights = this.praxis.run(
      this,
      previousLayer,
      nextLayer,
      learningRate
    );
    // this.deltas = deltas;
    release(oldWeights);
    clear(this.deltas);
  }

  validate() {
    throw new Error(`${this.constructor.name}-validate is not yet implemented`);
  }

  reset() {
    throw new Error(`${this.constructor.name}-reset is not yet implemented`);
  }
}

function recurrentZeros() {
  return new RecurrentZeros();
}

module.exports = {
  RecurrentZeros,
  recurrentZeros,
};

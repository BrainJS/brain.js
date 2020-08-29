const { Internal } = require('./types');
// const zeros2D = require('../utilities/zeros-2d');
const { release } = require('../utilities/kernel');

class RecurrentConnection extends Internal {
  setLayer(layer) {
    this.layer = layer;
  }

  get width() {
    return this.layer.width;
  }

  set width(value) {
    throw new Error(`${this.constructor.name}-width is not yet implemented`);
  }

  get height() {
    return this.layer.height;
  }

  set height(value) {
    throw new Error(`${this.constructor.name}-height is not yet implemented`);
  }

  get deltas() {
    return this.layer.deltas;
  }

  set deltas(deltas) {
    release(this.layer.deltas);
    this.layer.deltas = deltas;
  }

  get weights() {
    return this.layer.weights;
  }

  set weights(weights) {
    release(this.layer.weights);
    this.layer.weights = weights;
  }

  predict() {
    // throw new Error(`${this.constructor.name}-predict is not yet implemented`)
  }

  compare() {
    // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
  }

  learn() {
    throw new Error('no longer using');
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
  RecurrentConnection,
};

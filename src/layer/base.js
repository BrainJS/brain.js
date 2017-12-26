'use strict';
import MomentumRootMeanSquaredPropagation from '../praxis/momentum-root-mean-squared-propagation';

export default class Base {
  static get defaults() {
    return {
      width: 1,
      height: 1,
      depth: 1,
      weights: null,
      errors: null,
      deltas: null,
      changes: null
    }
  };

  constructor(settings = {}) {
    //size
    this.width = null;
    this.height = null;
    this.depth = null;

    //methods
    this.predictKernel = null;
    this.compareKernel = null;
    this.learnKernel = null;

    //what matters :P
    this.errors = null;
    this.deltas = null;
    this.weights = null;

    Object.assign(this, this.constructor.defaults, settings);
  }

  validate() {}

  setupKernels() {}

  predict() {}

  compare(previousLayer, nextLayer) {}

  learn() {
    this.weights = this.praxis.run(this.weights, this.deltas);
  }

  toArray() {
    return this.weights.toArray();
  }
}
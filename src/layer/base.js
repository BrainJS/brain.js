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
    };
  }

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

    this.praxis = null;
    Object.assign(this, this.constructor.defaults, settings);

    // special settings
    if (settings.hasOwnProperty('praxis')) {
      this.praxis = settings.praxis(this);
    }
  }

  validate() {}

  setupKernels() {}

  predict() {
    throw new Error('`predict` not defined on Base layer');
  }

  compare(previousLayer, nextLayer) {
    throw new Error('`compare` not defined on Base layer');
  }

  learn(previousLayer, nextLayer, learningRate) {
    this.weights = this.praxis.run(this.weights, this.deltas);
  }

  toArray() {
    return this.weights.toArray();
  }
}
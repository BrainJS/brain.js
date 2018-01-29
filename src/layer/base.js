export default class Base {
  static get defaults() {
    return {
      width: 1,
      height: 1,
      weights: null,
      deltas: null
    };
  }

  constructor(settings = {}) {
    //size
    this.width = null;
    this.height = null;
    this.depth = null;

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
    this.weights = this.praxis.run(previousLayer, nextLayer, learningRate);
  }

  toArray() {
    return this.weights.toArray();
  }

  toJSON() {
    const jsonLayer = {};
    const { defaults, name } = this.constructor;
    const keys = Object.keys(defaults);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === 'deltas') continue;
      jsonLayer[key] = this[key];
    }
    jsonLayer.type = name;
    return jsonLayer;
  }
}
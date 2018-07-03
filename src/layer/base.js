import zeros2D from '../utilities/zeros-2d';

export default class Base {
  static get defaults() {
    return {
      width: 1,
      height: 1,
      depth: 1,
      weights: null,
      deltas: null,
      name: null
    };
  }

  constructor(settings = {}) {
    //size
    this.width = null;
    this.height = null;

    //what matters :P
    this.deltas = null;
    this.weights = null;

    this.praxis = null;
    if (this.constructor !== Base) {
      Object.assign(this, Base.defaults, settings);
    }
    Object.assign(this, this.constructor.defaults, settings);

    // special settings
    if (settings.hasOwnProperty('praxis')) {
      if (typeof settings.praxis === 'function') {
        this.praxis = settings.praxis(Object.assign({
          height: this.height,
          width: this.width
        }, settings));
      } else {
        this.praxis = settings.praxis;
      }
    }
  }

  /*
  get weights() {
    return this._weights;
  }

  set weights(value) {
    if (value) {
      if (value[0].length !== this.width) {
        throw new Error(`${this.constructor.name}.weights being set with improper value width`);
      }
      if (value.length !== this.height) {
        throw new Error(`${this.constructor.name}.weights being set with improper value height`);
      }
    }
    this._weights = value;
  }

  get deltas() {
    return this._deltas;
  }

  set deltas(value) {
    if (value) {
      if (value[0].length !== this.width) {
        throw new Error(`${this.constructor.name}.deltas being set with improper value width`);
      }
      if (value.length !== this.height) {
        throw new Error(`${this.constructor.name}.deltas being set with improper value height`);
      }
    }
    this._deltas = value;
  }*/

  validate() {
    if (isNaN(this.height)) {
      throw new Error(`${this.constructor.name} layer height is not a number`)
    }
    if (isNaN(this.width)) {
      throw new Error(`${this.constructor.name} layer width is not a number`)
    }
    if (this.height < 1) {
      throw new Error(`${this.constructor.name} layer height is less than 1`);
    }
    if (this.width < 1) {
      throw new Error(`${this.constructor.name} layer width is less than 1`);
    }
  }

  setupKernels() {}
  reuseKernels(layer) {
    if (layer.width !== this.width) {
      throw new Error(`${this.constructor.name} kernel width mismatch ${layer.width} is not ${this.width}`);
    }
    if (layer.height !== this.height) {
      throw new Error(`${this.constructor.name} kernel width mismatch ${layer.height} is not ${this.height}`);
    }
    if (layer.hasOwnProperty('predictKernel')) {
      this.predictKernel = layer.predictKernel;
    }
    if (layer.hasOwnProperty('compareKernel')) {
      this.compareKernel = layer.compareKernel;
    }
    this.praxis = layer.praxis;
  }

  predict() {
    throw new Error('`predict` not defined on Base layer');
  }

  compare(previousLayer, nextLayer) {
    throw new Error('`compare` not defined on Base layer');
  }

  learn(previousLayer, nextLayer, learningRate) {
    this.weights = this.praxis.run(this, previousLayer, nextLayer, learningRate);
    this.deltas = zeros2D(this.width, this.height);
  }

  toArray() {
    return this.weights.toArray();
  }

  toJSON() {
    const jsonLayer = {};
    const { defaults, name } = this.constructor;
    if (this.constructor !== Base) {
      Object.assign(defaults, Base.defaults, defaults);
    }
    const keys = Object.keys(defaults);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === 'deltas') continue;
      if (key === 'name' && this[key] === null) continue;
      jsonLayer[key] = this[key];
    }
    jsonLayer.type = name;
    return jsonLayer;
  }
}
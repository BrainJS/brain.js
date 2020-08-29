const { release, clear } = require('../utilities/kernel');

class Base {
  static get defaults() {
    return {
      width: 1,
      height: 1,
      depth: null,
      weights: null,
      deltas: null,
      name: null,
      praxisOpts: null,
    };
  }

  constructor(settings) {
    // size
    this.width = null;
    this.height = null;
    this.depth = null;

    // what matters :P
    this.deltas = null;
    this.weights = null;

    this.praxis = null;
    this.praxisOpts = null;

    if (this.constructor !== Base) {
      Object.assign(this, Base.defaults, settings);
    }
    Object.assign(this, this.constructor.defaults, settings);

    // special settings
    this.setupPraxis(settings);
  }

  setupPraxis(settings) {
    if (!settings) return;
    if (settings.hasOwnProperty('praxis')) {
      if (typeof settings.praxis === 'function') {
        this.praxis = settings.praxis(this, settings.praxisOpts);
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
      if (value.dimensions) {
        if (value.dimensions[0] !== this.width) {
          throw new Error(`${this.constructor.name}.weights being set with improper value width`);
        }
        if (value.dimensions[1] !== this.height) {
          throw new Error(`${this.constructor.name}.weights being set with improper value height`);
        }
      } else {
        if (value[0].length !== this.width) {
          throw new Error(`${this.constructor.name}.weights being set with improper value width`);
        }
        if (value.length !== this.height) {
          throw new Error(`${this.constructor.name}.weights being set with improper value height`);
        }
      }
    }
    this._weights = value;
  }

  get deltas() {
    return this._deltas;
  }

  set deltas(value) {
    if (value) {
      if (value.dimensions) {
        if (value.dimensions[0] !== this.width) {
          throw new Error(`${this.constructor.name}.deltas being set with improper value width`);
        }
        if (value.dimensions[1] !== this.height) {
          throw new Error(`${this.constructor.name}.deltas being set with improper value height`);
        }
      } else {
        if (value[0].length !== this.width) {
          throw new Error(`${this.constructor.name}.deltas being set with improper value width`);
        }
        if (value.length !== this.height) {
          throw new Error(`${this.constructor.name}.deltas being set with improper value height`);
        }
      }
    }
    this._deltas = value;
  } */

  validate() {
    if (Number.isNaN(this.height)) {
      throw new Error(`${this.constructor.name} layer height is not a number`);
    }
    if (Number.isNaN(this.width)) {
      throw new Error(`${this.constructor.name} layer width is not a number`);
    }
    if (this.height < 1) {
      throw new Error(`${this.constructor.name} layer height is less than 1`);
    }
    if (this.width < 1) {
      throw new Error(`${this.constructor.name} layer width is less than 1`);
    }
  }

  setupKernels() {
    // console.log(`${this.constructor.name}-setupKernels is not yet implemented`)
  }

  reuseKernels(layer) {
    if (layer.width !== this.width) {
      throw new Error(
        `${this.constructor.name} kernel width mismatch ${layer.width} is not ${this.width}`
      );
    }
    if (layer.height !== this.height) {
      throw new Error(
        `${this.constructor.name} kernel width mismatch ${layer.height} is not ${this.height}`
      );
    }
    if (layer.hasOwnProperty('predictKernel')) {
      if (!layer.predictKernel.immutable) {
        throw new Error(
          `${layer.constructor.name}.predictKernel is not reusable, set kernel.immutable = true`
        );
      }
      this.predictKernel = layer.predictKernel;
    }
    if (layer.hasOwnProperty('compareKernel')) {
      if (!layer.compareKernel.immutable) {
        throw new Error(
          `${layer.constructor.name}.compareKernel is not reusable, set kernel.immutable = true`
        );
      }
      this.compareKernel = layer.compareKernel;
    }
    this.praxis = layer.praxis;
  }

  predict() {
    // throw new Error(`${this.constructor.name}-predict is not yet implemented`)
  }

  // eslint-disable-next-line
  compare() {
    // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
  }

  learn(previousLayer, nextLayer, learningRate) {
    // TODO: do we need to release here?
    const { weights: oldWeights } = this;
    this.weights = this.praxis.run(
      this,
      previousLayer,
      nextLayer,
      learningRate
    );
    release(oldWeights);
    clear(this.deltas);
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

module.exports = {
  Base,
};

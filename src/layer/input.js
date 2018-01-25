import Base from './base';
import zeros2D from '../utilities/zeros-2d';

export default class Input extends Base {
  constructor(settings) {
    super(settings);
    if (this.height === 1) {
      this.predict = this.predict1D;
      this.height = this.width;
      this.width = 1;
    }
    this.deltas = zeros2D(this.width, this.height);
  }

  setupKernels() {}

  predict(inputs) {
    this.deltas = zeros2D(this.width, this.height);
    this.weights = inputs;
  }

  predict1D(inputs) {
    this.deltas = zeros2D(this.width, this.height);
    this.weights = [];
    for (let y = 0; y < inputs.length; y++) {
      this.weights.push([inputs[y]]);
    }
  }

  compare() {}
  learn() {}

  toJSON() {
    const jsonLayer = {};
    const { defaults, name } = this.constructor;
    const keys = Object.keys(defaults);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      switch (key) {
        case 'deltas':
        case 'weights':
          continue;
      }
      jsonLayer[key] = this[key];
    }
    jsonLayer.type = name;
    return jsonLayer;
  }
}
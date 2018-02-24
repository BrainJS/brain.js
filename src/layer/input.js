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
    this.weights = null;
    this.deltas = zeros2D(this.width, this.height);
  }

  predict(inputs) {
    this.weights = inputs;
  }

  predict1D(inputs) {
    this.weights = [];
    for (let x = 0; x < inputs.length; x++) {
      this.weights.push([inputs[x]]);
    }
  }

  compare() {}
  learn() {
    this.deltas = zeros2D(this.width, this.height);
  }

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
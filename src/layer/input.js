import Base from './base';
import zeros2D from '../utilities/zeros-2d';
import { kernelInput } from '../utilities/kernel';

export default class Input extends Base {
  constructor(settings) {
    super(settings);
    if (this.width === 1) {
      this.predict = this.predict1D;
    }
    this.validate();
    this.weights = null;
    this.deltas = zeros2D(this.width, this.height);
  }

  predict(inputs) {
    if (inputs.length === this.height * this.width) {
      this.weights = kernelInput(inputs, [this.width, this.height]);
    } else if (input.length === this.height && input[0].length === this.width) {
      this.weights = inputs;
    } else {
      throw new Error('Inputs are not of sized correctly');
    }
  }

  predict1D(inputs) {
    const weights = [];
    for (let x = 0; x < inputs.length; x++) {
      weights.push([inputs[x]]);
    }
    this.weights = weights;
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
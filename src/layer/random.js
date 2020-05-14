const { Model } = require('./types');
const randos2D = require('../utilities/randos-2d');
const zeros2D = require('../utilities/zeros-2d');

class Random extends Model {
  static get defaults() {
    return {
      std: null, // standard deviation
    };
  }

  constructor(settings) {
    super(settings);
    this.validate();

    if (!this.weights) {
      this.weights = settings.std
        ? randos2D(this.width, this.height, settings.std)
        : randos2D(this.width, this.height);
    }
    if (!this.deltas) {
      this.deltas = zeros2D(this.width, this.height);
    }
  }

  predict() {
    // throw new Error(`${this.constructor.name}-predict is not yet implemented`)
  }

  compare() {
    // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
  }
}

function random(settings) {
  return new Random(settings);
}

module.exports = {
  Random,
  random,
};

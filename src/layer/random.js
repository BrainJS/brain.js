const { Model } = require('./types');
const randos2D = require('../utilities/randos-2d');
const zeros2D = require('../utilities/zeros-2d');

class Random extends Model {
  constructor(settings) {
    super(settings);
    this.validate();
    this.weights = randos2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
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
  random
};

const zeros2D = require('../utilities/zeros-2d');
const { Model } = require('./types');

class Zeros extends Model {
  constructor(settings) {
    super(settings);
    this.validate();
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }

  predict() {
    // throw new Error(`${this.constructor.name}-predict is not yet implemented`)
  }

  compare() {
    // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
  }
}

function zeros(settings) {
  return new Zeros(settings);
}

module.exports = {
  Zeros,
  zeros
};

const ones2D = require('../utilities/ones-2d');
const zeros2D = require('../utilities/zeros-2d');
const { Model } = require('./types');

class Ones extends Model {
  constructor(settings) {
    super(settings);
    this.validate();
    this.weights = ones2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }
}

function ones(settings) {
  return new Ones(settings);
}

module.exports = {
  Ones,
  ones,
};

const ones2D = require('../utilities/ones-2d');
const zeros2D = require('../utilities/zeros-2d');
const Model = require('./types').Model;

class Ones extends Model {
  constructor(settings) {
    super(settings);
    this.validate();
    this.weights = ones2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }
}

module.exports = Ones;

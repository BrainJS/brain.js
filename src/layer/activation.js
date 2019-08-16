const { Base } = require('./base');
const zeros2D = require('../utilities/zeros-2d');
const zeros3D = require('../utilities/zeros-3d');

class Activation extends Base {
  constructor(inputLayer, settings) {
    super();
    this.inputLayer = inputLayer;

    const { width, height, depth } = inputLayer;
    this.predictKernel = null;
    this.compareKernel = null;
    this.width = width;
    this.height = height;
    this.validate();
    if (depth > 0) {
      this.depth = depth;
      this.weights = zeros3D(width, height, depth);
      this.deltas = zeros3D(width, height, depth);
    } else {
      this.weights = zeros2D(width, height);
      this.deltas = zeros2D(width, height);
    }
    this.setupPraxis(settings);
  }
}

module.exports = { Activation };

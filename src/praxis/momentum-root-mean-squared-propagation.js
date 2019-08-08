const { makeKernel, makeDevKernel } = require('../utilities/kernel');
const zeros2D = require('../utilities/zeros-2d');

const { Base } = require('./base');

function getMomentum(delta, decay, previousMomentum) {
  return previousMomentum * decay + (1 - decay) * delta * delta;
}

function clipByValue(value, max, min) {
  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }
  return value;
}

/**
 * @description Momentum Root Mean Square Propagation Function
 * @returns {number}
 */
function update(
  weights,
  deltas,
  previousMomentums
) {
  const delta = deltas[this.thread.y][this.thread.x];
  const clippedDelta = clipByValue(
    delta,
    this.constants.clipValue,
    -this.constants.clipValue
  );
  const weight = weights[this.thread.y][this.thread.x];
  const previousMomentum = previousMomentums[this.thread.y][this.thread.x];
  const momentum = getMomentum(
    delta,
    this.constants.decayRate,
    previousMomentum
  );
  return (
    weight +
    (-this.constants.learningRate * clippedDelta) /
      Math.sqrt(momentum + this.constants.smoothEps) -
    this.constants.regularizationStrength * weight
  );
}

function isClippedByValue(value, max, min) {
  if (value > max) {
    return 1;
  }
  if (value < min) {
    return 1;
  }
  return 0;
}

class MomentumRootMeanSquaredPropagation extends Base {
  static get defaults() {
    return {
      decayRate: 0.999,
      regularizationStrength: 0.000001,
      learningRate: 0.01,
      smoothEps: 1e-8,
      clipValue: 5
    };
  }

  constructor(layer, settings = {}) {
    super(layer, settings);
    this.momentums = zeros2D(layer.width, layer.height);
    this.setupKernels();
  }

  run(layer, previousLayer, nextLayer, learningRate) {
    const output = this.kernel(layer.weights, layer.deltas, this.momentums);
    this.momentums = output.momentums;
    return output.result;
  }

  setupKernels() {
    this.kernel = makeKernel(update, {
      output: [this.width, this.height],
      constants: {
        clipValue: this.clipValue,
        decayRate: this.decayRate,
        learningRate: this.learningRate,
        regularizationStrength: this.regularizationStrength,
        smoothEps: this.smoothEps,
      },
      functions: [clipByValue],
      map: {
        momentums: getMomentum,
      },
    });
  }
}

function momentumRootMeanSquaredPropagation(layer, settings) {
  return new MomentumRootMeanSquaredPropagation(layer, settings);
}

/**
 * @description Mathematician friendly name of MomentumRootMeanSquaredPropagation class. For those that are not mere mortals
 * @type {MomentumRootMeanSquaredPropagation}
 */
const MRmsProp = MomentumRootMeanSquaredPropagation;
const mRmsProp = momentumRootMeanSquaredPropagation;

module.exports = {
  MomentumRootMeanSquaredPropagation, momentumRootMeanSquaredPropagation,
  MRmsProp, mRmsProp,
  getMomentum, clipByValue, isClippedByValue
};

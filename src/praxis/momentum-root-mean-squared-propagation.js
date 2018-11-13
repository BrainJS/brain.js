import { makeKernel } from '../utilities/kernel';
import zeros2D from '../utilities/zeros-2d';

function getMomentum(delta, decay, previousMomentum) {
  return previousMomentum * decay + (1 - decay) * delta * delta;
}

export function clipByValue(value, max, min) {
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
function momentumRootMeanSquaredPropagation(
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

export function isClippedByValue(value, max, min) {
  if (value > max) {
    return 1;
  }
  if (value < min) {
    return 1;
  }
  return 0;
}

export default class MomentumRootMeanSquaredPropagation {
  static get defaults() {
    return {
      decayRate: 0.999,
      regularizationStrength: 0.000001,
      learningRate: 0.01,
      smoothEps: 1e-8,
      clipValue: 5,
    };
  }

  constructor(layer, settings = {}) {
    this.layer = layer;
    this.width = layer.width;
    this.height = layer.height;
    this.momentums = zeros2D(layer.width, layer.height);
    Object.assign(this, this.constructor.defaults, settings);
    this.setupKernels();
  }

  run(layer, previousLayer, nextLayer, learningRate) {
    const output = this.kernel(layer.weights, layer.deltas, this.momentums);
    this.momentums = output.momentums;
    return output.result;
  }

  setupKernels() {
    this.kernel = makeKernel(momentumRootMeanSquaredPropagation, {
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

/**
 * @description Mathematician friendly name of MomentumRootMeanSquaredPropagation class. For those that are not mere mortals
 * @type {MomentumRootMeanSquaredPropagation}
 */
const MRmsProp = MomentumRootMeanSquaredPropagation;

export { getMomentum, MRmsProp };

import makeKernel from '../utilities/make-kernel';
import zeros2d from "../utilities/zeros-2d";

export default class MomentumRootMeanSquaredPropagation {
  static get defaults() {
    return {
      decayRate: 0.999,
      regularizationStrength: 0.00001
    };
  }

  constructor(inputLayer, settings = {}) {
    this.inputLayer = inputLayer;
    this.width = inputLayer.width;
    this.height = inputLayer.height;
    this.momentums = zeros2d(inputLayer.width, inputLayer.height);
    Object.assign(this, this.constructor.defaults, settings);
  }

  run(weights, deltas) {
    const output = this.momentumsKernel(weights, deltas, this.momentums, this.decayRate, this.regularizationStrength);
    this.momentums = output.momentums;
    return output.result;
  }

  setupKernels() {
    this.momentumsKernel = makeKernel(momentumRootMeanSquaredPropagation, {
      output: [this.width, this.height],
      map: {
        momentums: getMomentum
      }
    })
  }
}

/**
 * @description Mathematician friendly name of MomentumRootMeanSquaredPropagation class. For those that are not mere mortals
 * @type {MomentumRootMeanSquaredPropagation}
 */
const MRmsProp = MomentumRootMeanSquaredPropagation;

/**
 * @description Momentum Root Mean Square Propagation Function
 * @returns {number}
 */
function momentumRootMeanSquaredPropagation(weights, deltas, previousMomentums, decayRate, regularizationStrength) {
  let delta = deltas[this.thread.y][this.thread.x];
  let weight = weights[this.thread.y][this.thread.x];
  let previousMomentum = previousMomentums[this.thread.y][this.thread.x];
  const momentum = getMomentum(delta, decayRate, previousMomentum);
  return weight + -this.constants.learningRate * delta / Math.sqrt(momentum + this.constants.smoothEps) - regularizationStrength * weight;
}

export function getMomentum(delta, decay, previousMomentum) {
  return previousMomentum * decay + (1 - decay) * delta * delta;
}

export {
  getMomentum,
  MRmsProp
};

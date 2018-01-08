import makeKernel from '../utilities/make-kernel';
import zeros2D from "../utilities/zeros-2d";

export default class MomentumRootMeanSquaredPropagation {
  static get defaults() {
    return {
      decayRate: 0.999,
      regularizationStrength: 0.00001,
      learningRate: 0.01,
      smoothEps: 1e-8
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

  run(weights, deltas, learningRate) {
    const output = this.momentumsKernel(weights, deltas, this.learningRate, this.momentums, this.decayRate, this.regularizationStrength);
    this.momentums = output.momentums;
    return output.result;
  }

  setupKernels() {
    this.momentumsKernel = makeKernel(momentumRootMeanSquaredPropagation, {
      output: [this.width, this.height],
      constants: {
        smoothEps: this.smoothEps
      },
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
function momentumRootMeanSquaredPropagation(weights, deltas, learningRate, previousMomentums, decayRate, regularizationStrength) {
  const delta = deltas[this.thread.y][this.thread.x];
  const weight = weights[this.thread.y][this.thread.x];
  const previousMomentum = previousMomentums[this.thread.y][this.thread.x];
  const momentum = getMomentum(delta, decayRate, previousMomentum);
  return weight + -learningRate * delta / Math.sqrt(momentum + this.constants.smoothEps) - regularizationStrength * weight;
}

function getMomentum(delta, decay, previousMomentum) {
  return previousMomentum * decay + (1 - decay) * delta * delta;
}

export {
  getMomentum,
  MRmsProp
};

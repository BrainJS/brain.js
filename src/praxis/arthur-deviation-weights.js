const { makeKernel } = require('../utilities/kernel');
const zeros2D = require('../utilities/zeros-2d');
const { Base } = require('./base');

function updateChange(value) {
  return value;
}

function update(changes, weights, incomingWeights, inputDeltas) {
  const lastChange = changes[this.thread.y][this.thread.x];
  const inputDelta = inputDeltas[this.thread.y][0];
  const weight = weights[this.thread.y][this.thread.x];
  const incoming = incomingWeights[this.thread.x][0];

  const change = this.constants.learningRate * inputDelta * incoming + this.constants.momentum * lastChange;
  updateChange(change);
  return weight + change;
}

class ArthurDeviationWeights extends Base {
  static get defaults() {
    return {
      learningRate: 0.3,
      momentum: 0.1
    };
  }

  constructor(layer, settings) {
    super(layer, settings);
    this.weightsLayer = null;
    this.incomingLayer = null;
    this.deltaLayer = null;

    if (settings) {
      if (settings.weightsLayer) {
        this.weightsLayer = settings.weightsLayer
      }
      if (settings.incomingLayer) {
        this.incomingLayer = settings.incomingLayer;
      }
      if (settings.deltaLayer) {
        this.deltaLayer = settings.deltaLayer;
      }
    }

    this.changes = zeros2D(layer.width, layer.height);
    this.setupKernels();
  }

  run(layer, previousLayer, nextLayer, learningRate) {
    const output = this.kernel(
      this.changes,
      this.weightsLayer.weights,
      this.incomingLayer.weights,
      this.deltaLayer.deltas
    );
    this.changes = output.changes;
    return output.result;
  }

  setupKernels() {
    this.kernel = makeKernel(update, {
      map: {
        changes: updateChange
      },
      output: [this.width, this.height],
      constants: {
        learningRate: this.learningRate,
        momentum: this.momentum
      }
    });
  }
}

function arthurDeviationWeights(layer, settings) {
  return new ArthurDeviationWeights(layer, settings);
}

module.exports = {
  ArthurDeviationWeights,
  arthurDeviationWeights,
  update,
  updateChange,
};

const { Filter } = require('./types');
const { makeKernel } = require('../utilities/kernel');

// TODO: implement random in glsl in gpu.js
function trainingPredict(inputs) {
  if (Math.random() < this.constants.probability) {
    return 0;
  }
  return inputs[this.thread.y][this.thread.x];
}

function predict(inputs) {
  return inputs[this.thread.y][this.thread.x] * this.constants.probability;
}

class Dropout extends Filter {
  static get defaults() {
    return {
      width: 0,
      height: 0,
      depth: 0,
      probability: 0.5,
      isTraining: false,
    };
  }

  constructor(settings, inputLayer) {
    super(settings);
    this.inputLayer = inputLayer;
    this.validate();
  }

  setupKernels() {
    if (this.isTraining) {
      this.predictKernel = makeKernel(trainingPredict, {
        output: [this.width, this.height, this.depth],
      });
    } else {
      this.predictKernel = makeKernel(predict, {
        output: [this.width, this.height, this.depth],
      });
    }
  }

  predict() {
    this.weights = this.predictKernel(this.inputLayer.weights);
  }

  compare() {
    this.deltas = this.learnKernel(this.deltas);
  }
}

function dropout(settings, inputLayer) {
  return new Dropout(settings, inputLayer);
}

module.exports = { Dropout, dropout, trainingPredict, predict };

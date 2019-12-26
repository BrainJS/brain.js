const { Filter } = require('./types');
const { makeKernel, release } = require('../utilities/kernel');

function setDropout(dropout) {
  return dropout;
}
function trainingPredict(inputs) {
  if (setDropout(Math.random()) < this.constants.probability) {
    return 0;
  }
  return inputs[this.thread.y][this.thread.x];
}

function predict(inputs) {
  return inputs[this.thread.y][this.thread.x] * this.constants.probability;
}

function compare(dropouts, deltas) {
  if (dropouts[this.thread.y][this.thread.x] === 0) {
    return 0;
  }
  return deltas[this.thread.y][this.thread.x];
}

class Dropout extends Filter {
  static get defaults() {
    return {
      width: 1,
      height: 1,
      depth: null,
      probability: 0.5
    };
  }

  constructor(inputLayer, settings) {
    super(settings);
    this.inputLayer = inputLayer;
    this.height = inputLayer.height;
    this.width = inputLayer.width;
    this.dropouts = null;
    this.validate();
  }

  setupKernels(isTraining) {
    const output = [this.width, this.height];

    if (isTraining) {
      this.predictKernel = makeKernel(trainingPredict, { output, map: { dropouts: setDropout } });
      this.compareKernel = makeKernel(compare, { output });
    } else {
      this.predictKernel = makeKernel(predict, { output });
    }
  }

  predict() {
    release(this.weights);
    release(this.dropouts);
    const { result, dropouts } = this.predictKernel(this.inputLayer.weights);
    this.weights = result;
    this.dropouts = dropouts;
  }

  compare() {
    release(this.deltas);
    this.deltas = this.compareKernel(this.dropouts, this.inputLayer.deltas);
  }
}

function dropout(settings, inputLayer) {
  return new Dropout(settings, inputLayer);
}

module.exports = { Dropout, dropout, setDropout, trainingPredict, predict, compare };

const { makeKernel, release } = require('../utilities/kernel');
const { Operator } = require('./types');
const zeros2D = require('../utilities/zeros-2d');
const { checkSameSize } = require('../utilities/layer-size');

function predict(weights, inputLayerWeights) {
  return (
    weights[this.thread.y][this.thread.x] *
    inputLayerWeights[this.thread.y][this.thread.x]
  );
}

function compare(weights, deltas) {
  return (
    weights[this.thread.y][this.thread.x] * deltas[this.thread.y][this.thread.x]
  );
}

class MultiplyElement extends Operator {
  constructor(inputLayer1, inputLayer2) {
    super();
    this.inputLayer1 = inputLayer1;
    this.inputLayer2 = inputLayer2;

    this.width = inputLayer1.width;
    this.height = inputLayer1.height;
    this.validate();
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);
  }

  validate() {
    super.validate();
    checkSameSize(this.inputLayer1, this.inputLayer2);
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
    });

    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height],
    });
  }

  predict() {
    const { weights } = this;
    this.weights = this.predictKernel(weights, this.inputLayer.weights);
    release(weights);
  }

  compare() {
    const { deltas } = this;
    this.deltas = this.compareKernel(this.weights, deltas);
    release(deltas);
  }
}

function multiplyElement(inputLayer1, inputLayer2) {
  return new MultiplyElement(inputLayer1, inputLayer2);
}

module.exports = { MultiplyElement, multiplyElement };

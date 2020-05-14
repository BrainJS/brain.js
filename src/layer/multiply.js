const { makeKernel, release, clear } = require('../utilities/kernel');
const zeros2D = require('../utilities/zeros-2d');
const { Operator } = require('./types');

function predict(weights1, weights2) {
  let sum = 0;
  for (let i = 0; i < this.constants.size; i++) {
    sum += weights1[this.thread.y][i] * weights2[i][this.thread.x];
  }
  return sum;
}

function compareFromX(deltas, inputDeltas, inputWeights) {
  let sum = inputDeltas[this.thread.y][this.thread.x];
  for (let i = 0; i < this.constants.size; i++) {
    sum += deltas[this.thread.y][i] * inputWeights[this.thread.x][i];
  }
  return sum;
}

function compareFromY(deltas, inputDeltas, inputWeights) {
  let sum = inputDeltas[this.thread.y][this.thread.x];
  for (let i = 0; i < this.constants.size; i++) {
    sum += deltas[i][this.thread.x] * inputWeights[i][this.thread.y];
  }
  return sum;
}

class Multiply extends Operator {
  constructor(inputLayer1, inputLayer2, settings = {}) {
    super();
    this.inputLayer1 = inputLayer1;
    this.inputLayer2 = inputLayer2;
    this.compareKernel1 = null;
    this.compareKernel2 = null;

    this.width = inputLayer2.width;
    this.height = inputLayer1.height;
    this.validate();
    this.weights = zeros2D(this.width, this.height);
    this.deltas = zeros2D(this.width, this.height);

    if (settings && settings.name) {
      this.name = settings.name;
    }
    this.setupPraxis(settings);
  }

  validate() {
    super.validate();
    if (this.inputLayer1.width !== this.inputLayer2.height) {
      throw new Error(
        `Layer width mismatch of ${this.inputLayer1.width} and ${this.inputLayer2.height}`
      );
    }
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      constants: {
        size: this.inputLayer2.height,
      },
      immutable: true,
    });
    this.compareKernel1 = makeKernel(compareFromX, {
      output: [this.inputLayer1.width, this.inputLayer1.height],
      constants: {
        size: this.inputLayer2.width,
      },
      immutable: true,
    });
    this.compareKernel2 = makeKernel(compareFromY, {
      output: [this.inputLayer2.width, this.inputLayer2.height],
      constants: {
        size: this.inputLayer1.height,
      },
      immutable: true,
    });
  }

  reuseKernels(layer) {
    super.reuseKernels(layer);
    this.compareKernel1 = layer.compareKernel1;
    this.compareKernel2 = layer.compareKernel2;
  }

  predict() {
    release(this.weights);
    this.weights = this.predictKernel(
      this.inputLayer1.weights,
      this.inputLayer2.weights
    );
    clear(this.deltas);
  }

  compare() {
    const inputLayer1Deltas = this.inputLayer1.deltas;
    const inputLayer2Deltas = this.inputLayer2.deltas;

    const newDeltas1 = this.compareKernel1(
      this.deltas,
      this.inputLayer1.deltas,
      this.inputLayer2.weights
    );
    const newDeltas2 = this.compareKernel2(
      this.deltas,
      this.inputLayer2.deltas,
      this.inputLayer1.weights
    );

    this.inputLayer2.deltas = newDeltas2;
    this.inputLayer1.deltas = newDeltas1;

    release(inputLayer1Deltas);
    release(inputLayer2Deltas);
  }

  learn() {}
}

function multiply(inputLayer1, inputLayer2, settings) {
  return new Multiply(inputLayer1, inputLayer2, settings);
}

module.exports = { Multiply, multiply, predict, compareFromX, compareFromY };

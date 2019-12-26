const { Filter } = require('./types');
const { makeKernel, release } = require('../utilities/kernel');
const values = require('../utilities/values');
const randos2D = require('../utilities/randos-2d');
const randos3D = require('../utilities/randos-3d');
const zeros = require('../utilities/zeros');
const zeros2D = require('../utilities/zeros-2d');
const zeros3D = require('../utilities/zeros-3d');

function predict(inputs, filters, biases) {
  let output = 0;
  let i = 0;
  for (let y = 0; y < this.constants.inputHeight; y++) {
    for (let x = 0; x < this.constants.inputWidth; x++) {
      output += inputs[y][x] * filters[this.thread.x][i];
      i++;
    }
  }
  return output + biases[this.thread.x];
}

function predict3D(inputs, filters, biases) {
  let output = 0;
  let i = 0;
  for (let z = 0; z < this.constants.inputDepth; z++) {
    for (let y = 0; y < this.constants.inputHeight; y++) {
      for (let x = 0; x < this.constants.inputWidth; x++) {
        output += inputs[z][y][x] * filters[this.thread.x][i];
        i++;
      }
    }
  }
  return output + biases[this.thread.x];
}

function compareInputDeltas(inputDeltas, deltas, filters) {
  let sum = 0;
  const filterX = this.thread.x + (this.thread.y * this.output.x);
  for (let filterY = 0; filterY < this.constants.filterCount; filterY++) {
    sum += filters[filterY][filterX] * deltas[0][filterY];
  }
  return sum + inputDeltas[this.thread.y][this.thread.x];
}

function compareInputDeltas3D(inputDeltas, deltas, filters) {
  let sum = 0;
  const filterX = this.thread.x + (this.thread.y * this.output.x);
  for (let filterY = 0; filterY < this.constants.filterCount; filterY++) {
    sum += filters[filterY][filterX] * deltas[0][filterY];
  }
  return sum + inputDeltas[this.thread.z][this.thread.y][this.thread.x];
}

function compareBiases(biases, deltas) {
  return biases[this.thread.x] + deltas[this.thread.y][this.thread.x];
}

function compareFilterDeltas(filterDeltas, inputWeights, deltas) {
  return filterDeltas[this.thread.y][this.thread.x] + (inputWeights[this.thread.y][this.thread.x] * deltas[this.constants.deltaY][this.constants.deltaX]);
}

function compareFilterDeltas3D(filterDeltas, inputWeights, deltas) {
  const inputZ = Math.floor(this.thread.x / (this.constants.inputWidth * this.constants.inputHeight));
  const inputY = Math.floor((this.thread.x - inputZ * this.constants.inputWidth * this.constants.inputHeight) / this.constants.inputWidth);
  const inputX = this.thread.x - this.constants.inputWidth * (inputY + this.constants.inputHeight * inputZ);
  return filterDeltas[this.thread.y][this.thread.x] + (inputWeights[inputZ][inputY][inputX] * deltas[0][this.thread.y]);
}

class FullyConnected extends Filter {
  static get defaults() {
    return {
      bias: 0.1,
    };
  }

  constructor(settings, inputLayer) {
    super(settings);
    this.inputLayer = inputLayer;
    this.validate();
    this.compareFilterDeltasKernel = null;
    this.compareInputDeltasKernel = null;
    this.compareBiasesKernel = null;

    const connectionCount = inputLayer.width * inputLayer.height * inputLayer.depth;

    this.biases = values(this.height, this.bias);
    this.biasDeltas = zeros(this.height);

    this.filters = randos2D(connectionCount, this.height);
    this.filterDeltas = zeros2D(connectionCount, this.height);

    if (this.depth > 0) {
      this.weights = randos3D(this.width, this.height);
      this.deltas = zeros3D(this.width, this.height);
    } else if (this.height > 0) {
      this.weights = randos2D(this.width, this.height);
      this.deltas = zeros2D(this.width, this.height);
    }
  }

  validate() {
    super.validate();
    if (this.depth > 0) throw new Error('depth not supported');
  }

  setupKernels() {
    const { inputLayer } = this;
    const connectionCount = inputLayer.width * inputLayer.height * inputLayer.depth;
    if (inputLayer.depth > 0) {
      this.predictKernel = makeKernel(predict3D, {
        output: [this.width, this.height],
        constants: {
          inputHeight: inputLayer.height,
          inputWidth: inputLayer.width,
          inputDepth: inputLayer.depth,
        },
      });

      this.compareFilterDeltasKernel = makeKernel(compareFilterDeltas3D, {
        output: [connectionCount, this.height],
        constants: {
          inputWidth: inputLayer.width,
          inputHeight: inputLayer.height,
        },
      });

      this.compareInputDeltasKernel = makeKernel(compareInputDeltas3D, {
        output: [inputLayer.width, inputLayer.height, inputLayer.depth],
        constants: {
          filterCount: this.height,
        },
      });
    } else {
      this.predictKernel = makeKernel(predict, {
        output: [this.width, this.height],
        constants: {
          inputHeight: inputLayer.height,
          inputWidth: inputLayer.width,
        },
      });

      this.compareFilterDeltasKernel = makeKernel(compareFilterDeltas, {
        output: [connectionCount, this.height],
        constants: {
          inputWidth: inputLayer.width,
        },
      });

      this.compareInputDeltasKernel = makeKernel(compareInputDeltas, {
        output: [inputLayer.width, inputLayer.height],
        constants: {
          filterCount: this.height,
        },
      });
    }

    this.compareBiasesKernel = makeKernel(compareBiases, {
      output: [this.width, this.height],
    });
  }

  predict() {
    this.weights = this.predictKernel(
      this.inputLayer.weights,
      this.filters,
      this.biases
    );
  }

  compare() {
    const inputLayerDeltas = this.inputLayer.deltas;
    this.inputLayer.deltas = this.compareInputDeltasKernel(
      inputLayerDeltas,
      this.deltas,
      this.filters
    );
    release(inputLayerDeltas);

    const { biasDeltas, filterDeltas } = this;
    // TODO: handle biasDeltas learn
    this.biasDeltas = this.compareBiasesKernel(this.biases, this.deltas);

    // TODO: handle filterDeltas learn
    this.filterDeltas = this.compareFilterDeltasKernel(
      filterDeltas,
      this.inputLayer.weights,
      this.deltas
    );
    release(biasDeltas);
    release(filterDeltas);
  }
}

function fullyConnected(settings, inputLayer) {
  return new FullyConnected(settings, inputLayer);
}

module.exports = { FullyConnected, fullyConnected, predict, predict3D, compareInputDeltas, compareInputDeltas3D, compareBiases, compareFilterDeltas, compareFilterDeltas3D };

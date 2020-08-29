const { makeKernel, release, clone } = require('../utilities/kernel');
const { Filter } = require('./types');
const randos = require('../utilities/randos');
const randos2D = require('../utilities/randos-2d');
const randos3D = require('../utilities/randos-3d');
const zeros = require('../utilities/zeros');
const zeros2D = require('../utilities/zeros-2d');
const zeros3D = require('../utilities/zeros-3d');

function getMaxValue(inputs) {
  let maxInput = -Infinity;
  for (let x = 0; x < this.constants.inputWidth; x++) {
    const input = inputs[x];
    if (input > maxInput) {
      maxInput = input;
    }
  }
  return maxInput;
}

function getMaxValue2D(inputs) {
  let maxInput = -Infinity;
  for (let y = 0; y < this.constants.inputHeight; y++) {
    for (let x = 0; x < this.constants.inputWidth; x++) {
      const input = inputs[y][x];
      if (input > maxInput) {
        maxInput = input;
      }
    }
  }
  return maxInput;
}

function getMaxValue3D(inputs) {
  let maxInput = -Infinity;
  for (let z = 0; z < this.constants.inputDepth; z++) {
    for (let y = 0; y < this.constants.inputHeight; y++) {
      for (let x = 0; x < this.constants.inputWidth; x++) {
        const input = inputs[z][y][x];
        if (input > maxInput) {
          maxInput = input;
        }
      }
    }
  }
  return maxInput;
}

function getSum(inputs) {
  let sum = 0;
  for (let x = 0; x < this.constants.inputWidth; x++) {
    sum += inputs[x];
  }
  return sum;
}

function getSum2D(inputs) {
  let sum = 0;
  for (let y = 0; y < this.constants.inputHeight; y++) {
    for (let x = 0; x < this.constants.inputWidth; x++) {
      sum += inputs[y][x];
    }
  }
  return sum;
}

function getSum3D(inputs) {
  let sum = 0;
  for (let z = 0; z < this.constants.inputDepth; z++) {
    for (let y = 0; y < this.constants.inputHeight; y++) {
      for (let x = 0; x < this.constants.inputWidth; x++) {
        sum += inputs[z][y][x];
      }
    }
  }
  return sum;
}

function getExponentials(inputs, maxInput) {
  return Math.exp(inputs[this.thread.x] - maxInput[0]);
}

function getExponentials2D(inputs, maxInput) {
  return Math.exp(inputs[this.thread.y][this.thread.x] - maxInput[0]);
}

function getExponentials3D(inputs, maxInput) {
  return Math.exp(
    inputs[this.thread.z][this.thread.y][this.thread.x] - maxInput[0]
  );
}

function predict(exponentials, exponentialsSum) {
  return exponentials[this.thread.x] / exponentialsSum[0];
}

function predict2D(exponentials, exponentialsSum) {
  return exponentials[this.thread.y][this.thread.x] / exponentialsSum[0];
}

function predict3D(exponentials, exponentialsSum) {
  return (
    exponentials[this.thread.z][this.thread.y][this.thread.x] /
    exponentialsSum[0]
  );
}

function compare(target, exponentials) {
  let indicator = 0;
  if (this.thread.x === target) {
    indicator = 1;
  }
  return -(indicator - exponentials[this.thread.x]);
}

function compare2D(target, exponentials) {
  let indicator = 0;
  const index = this.thread.x + this.thread.y * this.output.x;
  if (index === target) {
    indicator = 1;
  }
  return -(indicator - exponentials[this.thread.y][this.thread.x]);
}

function compare3D(target, exponentials) {
  let indicator = 0;
  const index =
    this.thread.x +
    this.thread.y * this.output.x +
    this.thread.z * this.output.x * this.output.y;
  if (index === target) {
    indicator = 1;
  }
  return -(
    indicator - exponentials[this.thread.z][this.thread.y][this.thread.x]
  );
}

function loss() {
  return -Math.log();
}

// TODO: handle: `return -Math.log(this.es[y]);` in learn

class SoftMax extends Filter {
  constructor(inputLayer) {
    super();
    this.width = inputLayer.width;
    this.height = inputLayer.height;
    this.depth = inputLayer.depth;
    this.getExponentialsKernel = null;
    this.getMaxValueKernel = null;
    this.getSumKernel = null;
    this.inputLayer = inputLayer;
    this.validate();

    if (this.depth > 0) {
      this.weights = randos3D(this.width, this.height, this.depth);
      this.deltas = zeros3D(this.width, this.height, this.depth);
    } else if (this.height > 0) {
      this.weights = randos2D(this.width, this.height);
      this.deltas = zeros2D(this.width, this.height);
    } else {
      this.weights = randos(this.width);
      this.deltas = zeros(this.width);
    }
  }

  setupKernels() {
    const { width, height, depth } = this;
    if (depth > 0) {
      this.getExponentialsKernel = makeKernel(getExponentials3D, {
        output: [width, height, depth],
      });
      this.getMaxValueKernel = makeKernel(getMaxValue3D, {
        output: [1, 1, 1],
        constants: {
          inputWidth: width,
          inputHeight: height,
          inputDepth: depth,
        },
      });
      this.getSumKernel = makeKernel(getSum3D, {
        output: [1, 1, 1],
        constants: {
          inputWidth: width,
          inputHeight: height,
          inputDepth: depth,
        },
      });
      this.predictKernel = makeKernel(predict3D, {
        output: [width, height, depth],
      });
      this.compareKernel = makeKernel(compare3D, {
        output: [width, height, depth],
        immutable: true,
      });
    } else {
      this.getExponentialsKernel = makeKernel(getExponentials, {
        output: [width, height],
      });
      this.getMaxValueKernel = makeKernel(getMaxValue2D, {
        output: [1, 1],
        constants: {
          inputWidth: width,
          inputHeight: height,
        },
      });
      this.getSumKernel = makeKernel(getSum2D, {
        output: [1, 1],
        constants: {
          inputWidth: width,
          inputHeight: height,
        },
      });
      this.predictKernel = makeKernel(predict2D, {
        output: [width, height],
      });
      this.compareKernel = makeKernel(compare2D, {
        output: [width, height],
        immutable: true,
      });
    }
  }

  predict() {
    const maxValue = this.getMaxValueKernel(this.inputLayer.weights);
    const exponentials = this.getExponentialsKernel(
      this.inputLayer.weights,
      maxValue
    );
    const exponentialsSum = this.getSumKernel(exponentials);
    this.weights = this.predictKernel(exponentials, exponentialsSum);
  }

  compare(targetValues) {
    const { deltas, errors } = this;
    this.errors = this.compareKernel(targetValues[0], deltas);
    this.deltas = clone(this.errors);
    release(deltas);
    release(errors);

    const inputLayerDeltas = this.inputLayer.deltas;
    this.inputLayer.deltas = clone(this.deltas);
    release(inputLayerDeltas);
  }
}

function softMax(settings, inputLayer) {
  return new SoftMax(settings, inputLayer);
}

module.exports = {
  SoftMax,
  softMax,
  getMaxValue,
  getMaxValue2D,
  getMaxValue3D,
  getSum,
  getSum2D,
  getSum3D,
  getExponentials,
  getExponentials2D,
  getExponentials3D,
  predict,
  predict2D,
  predict3D,
  compare,
  compare2D,
  compare3D,
  loss,
};

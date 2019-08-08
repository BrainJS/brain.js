const { Filter } = require('./types');
const { makeKernel } = require('../utilities/kernel');
const { setPadding, setStride } = require('../utilities/layer-setup');
const zeros3D = require('../utilities/zeros-3d');
const randos3D = require('../utilities/randos-3d');

function setSwitchY(value) {
  return value;
}

function setSwitchX(value) {
  return value;
}

function predict(inputs) {
  const x = Math.floor(
    (this.thread.x / this.output.x) * this.constants.inputWidth -
      this.constants.paddingX
  );
  const y = Math.floor(
    (this.thread.y / this.output.y) * this.constants.inputHeight -
      this.constants.paddingY
  );
  let largestValue = -Infinity;
  let largestX = -1;
  let largestY = -1;

  // convolve centered at this particular location
  for (let filterY = 0; filterY < this.constants.filterHeight; filterY++) {
    // coordinates in the original input array coordinates
    const inputY = filterY + y;
    for (let filterX = 0; filterX < this.constants.filterWidth; filterX++) {
      const inputX = filterX + x;
      if (
        inputY >= 0 &&
        inputY < this.constants.inputHeight &&
        inputX >= 0 &&
        inputX < this.constants.inputWidth
      ) {
        const input = inputs[this.thread.z][inputY][inputX];
        if (input > largestValue) {
          largestValue = input;
          largestY = inputY;
          largestX = inputX;
        }
      }
    }
  }
  setSwitchY(largestY);
  setSwitchX(largestX);
  return largestValue;
}

function compare(deltas, switchY, switchX) {
  const x = Math.floor(
    (this.thread.x / this.output.x) * this.constants.outputWidth
  );
  const y = Math.floor(
    (this.thread.y / this.output.y) * this.constants.outputHeight
  );

  let value = 0;

  for (let deltasY = 0; deltasY < this.constants.inputHeight; deltasY++) {
    for (let deltasX = 0; deltasX < this.constants.inputWidth; deltasX++) {
      const switchXValue = switchX[deltasY][deltasX];
      const switchYValue = switchY[deltasY][deltasX];
      if (switchXValue === x && switchYValue === y) {
        value += deltas[deltasY][deltasX];
      }
    }
  }

  return value;
}

function compare3D(deltas, switchY, switchX) {
  const x = Math.floor(
    (this.thread.x / this.output.x) * this.constants.outputWidth
  );
  const y = Math.floor(
    (this.thread.y / this.output.y) * this.constants.outputHeight
  );

  let value = 0;

  for (let deltasY = 0; deltasY < this.constants.inputHeight; deltasY++) {
    for (let deltasX = 0; deltasX < this.constants.inputWidth; deltasX++) {
      const switchXValue = switchX[this.thread.z][deltasY][deltasX];
      const switchYValue = switchY[this.thread.z][deltasY][deltasX];
      if (switchXValue === x && switchYValue === y) {
        value += deltas[this.thread.z][deltasY][deltasX];
      }
    }
  }

  return value;
}

class Pool extends Filter {
  static get defaults() {
    return {
      padding: 0,
      bias: 0,
      filterWidth: 0,
      filterHeight: 0,
      filterCount: 0,
    };
  }

  constructor(settings, inputLayer) {
    super(settings);

    this.stride = null;
    this.strideX = null;
    this.strideY = null;
    setStride(this, settings);

    this.padding = null;
    this.paddingX = null;
    this.paddingY = null;
    setPadding(this, settings);

    this.filterCount = settings.filterCount;
    this.filterWidth = settings.filterWidth;
    this.filterHeight = settings.filterHeight;

    this.width = Math.floor(
      (inputLayer.width + this.paddingX * 2 - this.filterWidth) / this.strideX +
        1
    );
    this.height = Math.floor(
      (inputLayer.height + this.paddingY * 2 - this.filterHeight) /
        this.strideY +
        1
    );
    // TODO: handle 1 depth?
    this.depth = this.filterCount;

    this.weights = randos3D(this.width, this.height, this.depth);
    this.deltas = zeros3D(this.width, this.height, this.depth);

    this.filters = randos3D(this.filterWidth, this.filterHeight, this.filterCount);
    this.filterDeltas = zeros3D(this.filterWidth, this.filterHeight, this.filterCount);

    this.learnFilters = null;
    this.learnInputs = null;
    this.inputLayer = inputLayer;
    this.validate();
  }

  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height, this.depth],
      map: {
        switchX: setSwitchX,
        switchY: setSwitchY,
      },
      constants: {
        inputWidth: this.inputLayer.width,
        inputHeight: this.inputLayer.height,
        paddingX: this.paddingX,
        paddingY: this.paddingY,
        filterHeight: this.filterHeight,
        filterWidth: this.filterWidth,
      },
    });

    this.compareKernel = makeKernel(compare, {
      output: [this.inputLayer.width, this.inputLayer.height, this.inputLayer.depth],
      constants: {
        outputWidth: this.width,
        outputHeight: this.height,
        outputDepth: this.depth,
        paddingX: this.paddingX,
        paddingY: this.paddingY,
      },
    });
  }

  predict() {
    const weights = this.predictKernel(this.inputLayer.weights);
    this.switchX = weights.switchX;
    this.switchY = weights.switchY;
    this.weights = weights.result;
    return this.weights;
  }

  compare() {
    debugger;
    const depth = this.inputLayer.deltas.length;
    const height = this.inputLayer.deltas[0].length;
    const width = this.inputLayer.deltas[0][0].length;
    const type = typeof this.inputLayer.deltas[0][0][0];
    this.inputLayer.deltas = this.compareKernel(
      this.deltas,
      this.switchX,
      this.switchY
    );
    debugger;
    if (depth !== this.inputLayer.deltas.length) debugger;
    if (height !== this.inputLayer.deltas[0].length) debugger;
    if (width !== this.inputLayer.deltas[0][0].length) debugger;
    if (type !== typeof this.inputLayer.deltas[0][0][0]) debugger;
  }
}

function pool(settings, inputLayer) {
  return new Pool(settings, inputLayer);
}

module.exports = { Pool, pool, predict, compare, compare3D };

const { EntryPoint } = require('./types');
const zeros2D = require('../utilities/zeros-2d');
const {
  makeKernel,
  release,
  kernelInput,
  clear,
  clone,
} = require('../utilities/kernel');

class Input extends EntryPoint {
  constructor(settings) {
    super(settings);
    this.validate();
    this.weights = null;
    this.reshapeInput = null;
    this.deltas = zeros2D(this.width, this.height);
  }

  setupKernels() {
    if (this.width === 1) {
      this.predict = this.predict1D;
      this.reshapeInput = makeKernel(
        function (value) {
          return value[this.thread.y];
        },
        {
          output: [1, this.height],
          immutable: true,
        }
      );
    } else {
      this.reshapeInput = (inputs) => inputs;
    }
  }

  reuseKernels(layer) {
    super.reuseKernels(layer);
    this.reshapeInput = layer.reshapeInput;
  }

  predict(inputs) {
    if (
      typeof inputs[0] !== 'object' &&
      inputs.length === this.height * this.width
    ) {
      release(this.weights);
      this.weights = kernelInput(inputs, [this.width, this.height]);
    } else if (
      inputs.length === this.height &&
      inputs[0].length === this.width
    ) {
      this.weights = clone(inputs);
    } else {
      throw new Error('Inputs are not of sized correctly');
    }
    clear(this.deltas);
  }

  predict1D(inputs) {
    if (this.weights) release(this.weights);
    this.weights = this.reshapeInput(inputs);
    clear(this.deltas);
  }

  compare() {
    // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
  }

  toJSON() {
    const jsonLayer = {};
    const { defaults, name } = this.constructor;
    const keys = Object.keys(defaults);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (key === 'deltas' || key === 'weights') continue;
      jsonLayer[key] = this[key];
    }
    jsonLayer.type = name;
    return jsonLayer;
  }
}

function input(settings) {
  return new Input(settings);
}

module.exports = {
  Input,
  input,
};

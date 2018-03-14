import NeuralNetwork from './neural-network';
import lookup from './lookup';
import GPU from 'gpu.js';

/**
 *
 * @param {object} options
 * @constructor
 */
export default class NeuralNetworkGPU extends NeuralNetwork {
  constructor(options = {}) {
    super(options);
    this.forwardPropagate = [];
    this.backwardPropagate = [];
    this.changesPropagate = [];
    this.biasesPropagate = [];
    this.biasCopies = [];
    this.copyBias = [];
    this.changesCopies = [];
    this.copyChanges = [];
    this.weightsCopies = [];
    this.copyWeights = [];
    this.errorCheckInterval = 100;
    this.gpu = new GPU({mode: options.mode});
  }

  /**
   *
   */
  _initialize() {
    super._initialize();
    this.buildRunInput();
    this.buildCalculateDeltas();
    this.buildGetChanges();
    this.buildChangeBiases();
    this.buildGetMSE();
  }

  setActivation() {}

  /**
   *
   * @param input
   * @param target
   * @param logErrorRate
   */
  _trainPattern(input, target, logErrorRate) {
    // forward propagate
    this.runInput(input);

    // backward propagate
    this.calculateDeltas(target);
    this.getChanges();
    this.changeBiases();

    if (logErrorRate) {
      return this.getMSE(this.errors[this.outputLayer])[0];
    } else {
      return null;
    }
  }

  buildRunInput() {
    let weightedSum = null;

    switch (this.activation) {
      case 'sigmoid':
        weightedSum = weightedSumSigmoid;
        break;
      case 'relu':
        weightedSum = weightedSumRelu;
        break;
      case 'leaky-relu':
        weightedSum = weightedSumLeakyRelu;
        break;
      case 'tanh':
        weightedSum = weightedSumTanh;
        break;
      default:
        throw new Error('unknown activation ' + this.activation);
    }

    for(let layer = 1; layer <= this.outputLayer; layer++){
      this.forwardPropagate[layer] = this.gpu.createKernel(weightedSum, {
        output: [this.sizes[layer]],
        outputToTexture: true,
        hardcodeConstants: true,
        constants: {
          size: this.sizes[layer - 1]
        }
      });
    }

    this._texturizeInputData = this.gpu.createKernel(function(value) {
      return value[this.thread.x];
    }, {
      output: [this.sizes[1]],
      outputToTexture: true,
      hardcodeConstants: true,
      outputImmutable: true
    });
  }

  /**
   *
   * @param input
   * @returns {*}
   */
  runInput(input) {
    let output;
    this.outputs[0] = input;
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      this.outputs[layer] = this.forwardPropagate[layer](
        this.weights[layer], 
        this.biases[layer], 
        input
      );
      output = input = this.outputs[layer];
    }
    return output;
  }

  buildCalculateDeltas() {
    let calcDeltas = null;

    switch (this.activation) {
      case 'sigmoid':
        calcDeltas = calcDeltasSigmoid;
        break;
      case 'relu':
        calcDeltas = calcDeltasRelu;
        break;
      case 'leaky-relu':
        calcDeltas = calcDeltasLeakyRelu;
        break;
      case 'tanh':
        calcDeltas = calcDeltasTanh;
        break;
      default:
        throw new Error('unknown activation ' + this.activation);
    }

    for (let layer = this.outputLayer; layer > 0; layer--) {
      if (layer === this.outputLayer) {
        this.backwardPropagate[layer] = this.gpu.createKernelMap({
            error: GPU.alias('calcErrorOutput', calcErrorOutput),
            deltas: GPU.alias('calcDeltas', calcDeltas)
          }, function(outputs, targets) {
            const output = outputs[this.thread.x];
            return calcDeltas(calcErrorOutput(output, targets), output);
          }, {
            output: [this.sizes[layer]],
            outputToTexture: true,
            hardcodeConstants: true
          });
      } else {
        this.backwardPropagate[layer] = this.gpu.createKernelMap({
            error: GPU.alias('calcError', calcError),
            deltas: GPU.alias('calcDeltas', calcDeltas),
          }, function(nextWeights, outputs, nextDeltas){
            let output = outputs[this.thread.x];
            return calcDeltas(calcError(nextWeights, nextDeltas), output);
          }, {
            output: [this.sizes[layer]],
            outputToTexture: true,
            hardcodeConstants: true,
            constants: {
              size: this.deltas[layer + 1].length
            }
          });
      }
    }
  }

  calculateDeltas(target) {
    for (let layer = this.outputLayer; layer > 0; layer--) {
      let output;

      if (layer === this.outputLayer) {
        output = this.backwardPropagate[layer](
          this.outputs[layer],
          target);
      } else {
        output = this.backwardPropagate[layer](
          this.weights[layer + 1],
          this.outputs[layer],
          this.deltas[layer + 1],
        );
      }

      this.deltas[layer] = output.deltas;
      this.errors[layer] = output.error;
    }
  }

  buildGetChanges() {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      this.changesPropagate[layer] = this.gpu.createKernelMap({
          weights: GPU.alias('addWeights', addWeights),
          changes: GPU.alias('calcChanges', calcChanges)
        },
        function(previousOutputs, deltas, weights, changes) {
          let change = calcChanges(
            changes,
            deltas,
            previousOutputs);

            return addWeights(change, weights);
        }, {
          output: [this.sizes[layer - 1], this.sizes[layer]],
          outputToTexture: true,
          hardcodeConstants: true,
          constants:{
            size: this.outputs[layer - 1].length,
            learningRate: this.trainOpts.learningRate,
            momentum: this.trainOpts.momentum
          }
        });

      this.copyChanges[layer] = this.gpu.createKernel(function(value) {
        return value[this.thread.y][this.thread.x];
      }, {
        output: this.changesPropagate[layer].output,
        outputToTexture: true,
        hardCodeConstants: true
      });

      this.copyWeights[layer] = this.gpu.createKernel(function(value) {
        return value[this.thread.y][this.thread.x];
      }, {
        output: this.changesPropagate[layer].output,
        outputToTexture: true,
        hardCodeConstants: true
      });
    }    
  }
  
  getChanges() {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      let output = this.changesPropagate[layer](
        this.outputs[layer - 1],
        this.deltas[layer],
        this.weightsCopies[layer] || this.weights[layer],
        this.changesCopies[layer] || this.changes[layer]
      );
      this.changes[layer] = output.changes;
      this.weights[layer] = output.weights;

      this.changesCopies[layer] = this.copyChanges[layer](output.changes);
      this.weightsCopies[layer] = this.copyWeights[layer](output.weights);
    }
  }

  buildChangeBiases() {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      this.biasesPropagate[layer] = this.gpu.createKernel(addBiases, {
        output: [this.sizes[layer]],
        outputToTexture: true,
        hardcodeConstants: true,
        constants: {
          learningRate: this.trainOpts.learningRate
        }
      });
      this.copyBias[layer] = this.gpu.createKernel(function(value) {
        return value[this.thread.x];
      }, {
        output: this.biasesPropagate[layer].output,
        outputToTexture: true,
        hardCodeConstants: true
      });
    }
  }

  changeBiases() {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      this.biases[layer] = this.biasesPropagate[layer](
        this.biasCopies[layer] || this.biases[layer],
        this.deltas[layer]
      );
      this.biasCopies[layer] = this.copyBias[layer](this.biases[layer]);
    }
  }

  buildGetMSE() {
    this.getMSE = this.gpu.createKernel(mse, {
      output: [1],
      hardcodeConstants: true,
      constants: {
        size: this.sizes[this.outputLayer]
      }
    });
  }

  /**
   *
   * @param input
   * @returns {*}
   */
  run(input) {
    if (!this.isRunnable) return null;
    if (this.inputLookup) {
      input = lookup.toArray(this.inputLookup, input);
    }
    const inputTexture = this._texturizeInputData(input);
    const outputTextures = this.runInput(inputTexture);
    let output = outputTextures.toArray(this.gpu);

    if (this.outputLookup) {
      output = lookup.toHash(this.outputLookup, output);
    }
    return output;
  }


  /**
   *
   * @param data
   * Verifies network sizes are initilaized
   * If they are not it will initialize them based off the data set.
   */
  _verifyIsInitialized(data) {
    if (this.sizes) return;

    this.sizes = [];
    if (!data[0].size) {
      data[0].size = { input: data[0].input.length, output: data[0].output.length };
    }

    this.sizes.push(data[0].size.input);
    if (!this.hiddenSizes) {
      this.sizes.push(Math.max(3, Math.floor(data[0].size.input / 2)));
    } else {
      this.hiddenSizes.forEach(size => {
        this.sizes.push(size);
      });
    }
    this.sizes.push(data[0].size.output);

    this._initialize();
  }

  /**
   *
   * @param data
   * @param options
   * @protected
   * @return { data, status, endTime }
   */
  _prepTraining(data, options) {
    this._updateTrainingOptions(options);
    data = this._formatData(data);
    const endTime = Date.now() + this.trainOpts.timeout;

    const status = {
      error: 1,
      iterations: 0
    };

    this._verifyIsInitialized(data);

    const texturizeOutputData = this.gpu.createKernel(function(value) {
      return value[this.thread.x];
    }, {
      output: [data[0].output.length],
      outputToTexture: true,
      hardcodeConstants: true,
      outputImmutable: true
    });

    return {
      data: data.map((set) => {
        return {
          size: set.size,
          input: this._texturizeInputData(set.input),
          output: texturizeOutputData(set.output)
        }
      }),
      status,
      endTime
    };
  }

  toFunction() {
    throw new Error('not implemented on NeuralNetworkGPU');
  }

}

function weightedSumSigmoid(weights, biases, inputs) {
  let sum = biases[this.thread.x];
  for (let k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  }
  //sigmoid
  return 1 / (1 + Math.exp(-sum));
}

function weightedSumRelu(weights, biases, inputs) {
  let sum = biases[this.thread.x];
  for (let k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  }
  //relu
  return (sum < 0 ? 0 : sum);
}

function weightedSumLeakyRelu(weights, biases, inputs) {
  let sum = biases[this.thread.x];
  for (let k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  }
  //leaky relu
  return (sum < 0 ? 0 : 0.01 * sum);
}

function weightedSumTanh(weights, biases, inputs) {
  let sum = biases[this.thread.x];
  for (let k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  }
  //tanh
  return Math.tanh(sum);
}

function calcErrorOutput(output, targets) {
  return targets[this.thread.x] - output;
}

function calcDeltasSigmoid(error, output) {
  //sigmoid derivative
  return error * output * (1 - output);
}

function calcDeltasRelu(error, output) {
  //relu derivative
  return output > 0 ? error : 0;
}

function calcDeltasLeakyRelu(error, output) {
  //leaky relu derivative
  return output > 0 ? error : 0.01 * error;
}

function calcDeltasTanh(error, output) {
  //tanh derivative
  return (1 - output * output) * error;
}

function calcError(nextWeights, nextDeltas){
  let error = 0;
  for(let k = 0; k < this.constants.size; k++){
    error += nextDeltas[k] * nextWeights[k][this.thread.x];
  }
  return error;
}

function calcChanges(
  previousChanges,
  deltas,
  previousOutputs
) {
  return (this.constants.learningRate * deltas[this.thread.y] * previousOutputs[this.thread.x])
      + (this.constants.momentum * previousChanges[this.thread.y][this.thread.x]);
}

function addWeights(change, weights){
  return change + weights[this.thread.y][this.thread.x];
}

function addBiases(biases, deltas){
  return biases[this.thread.x] + (deltas[this.thread.x] * this.constants.learningRate);
}

// mean squared error, reimplemented for GPU
function mse(errors) {
  let sum = 0;
  for (let i = 0; i < this.constants.size; i++) {
    sum += Math.pow(errors[i], 2);
  }
  return sum / this.constants.size;
}
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
    this.gpu = new GPU({mode: options.mode});
  }

  /**
   *
   * @param {Number[]} sizes
   */
  _initialize(sizes) {
    super._initialize(sizes);
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
   * @param learningRate
   */
  _trainPattern(input, target, learningRate) {
    learningRate = learningRate || this.trainOpts.learningRate;
    // forward propagate
    this.runInput(input);

    // backward propagate
    this.calculateDeltas(target);
    this.getChanges(learningRate);
    this.changeBiases(learningRate);

    return this.getMSE(this.errors[this.outputLayer])[0];
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
        constants: {
          size: this.sizes[layer - 1]
        }
      });
    }
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
      if (layer === this.outputLayer){
        this.backwardPropagate[layer] = this.gpu.createKernelMap({
            error: GPU.alias('calcErrorOutput', calcErrorOutput),
            deltas: GPU.alias('calcDeltas', calcDeltas)
          }, function(outputs, targets) {
            const output = outputs[this.thread.x];
            return calcDeltas(calcErrorOutput(output, targets), output);
          }, {
            output: [this.sizes[layer]],
            outputToTexture: true
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
            constants: {
              size: this.deltas[layer + 1].length
            }
          });
      }
    }
  }

  calculateDeltas(target, learningRate) {
    for (let layer = this.outputLayer; layer > 0; layer--) {
      let output;
      if (layer === this.outputLayer){
        output = this.backwardPropagate[layer](
          this.outputs[layer],
          target);
      } else {
        output = this.backwardPropagate[layer](
          this.weights[layer + 1],
          this.outputs[layer],
          this.deltas[layer + 1],
        )}

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
        function(previousOutputs, deltas, weights, changes, learningRate, momentum) {
          let change = calcChanges(
            changes,
            deltas,
            previousOutputs,
            learningRate,
            momentum);

            return addWeights(change, weights);
        }, {
          output: [this.sizes[layer -1], this.sizes[layer]],
          outputToTexture: true,
          constants:{
            size: this.outputs[layer - 1].length
          }
        });
    }    
  }
  
  getChanges(learningRate) {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      let output = this.changesPropagate[layer](
        this.outputs[layer - 1],
        this.deltas[layer],
        this.weights[layer],
        this.changes[layer],
        learningRate,
        this.trainOpts.momentum
      );
      
      this.changes[layer] = output.changes;
      this.weights[layer] = output.weights;
    }
  }

  buildChangeBiases() {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      this.biasesPropagate[layer] = this.gpu.createKernel(addBiases, {
        output: [this.sizes[layer]],
        outputToTexture: true
      });
    }
  }

  changeBiases(learningRate) {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      this.biases[layer] = this.biasesPropagate[layer](
        this.biases[layer],
        this.deltas[layer],
        learningRate
      );
    }
  }

  buildGetMSE() {
    this.getMSE = this.gpu.createKernel(mse, {
      output: [1],
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
    let output = [...this.runInput(input).toArray(this.gpu)];

    if (this.outputLookup) {
      output = lookup.toHash(this.outputLookup, output);
    }
    return output;
  }

  /**
   *
   * @param data
   * @returns {*}
   */
  _formatData(data) {
    if (!Array.isArray(data)) { // turn stream datum into array
      let tmp = [];
      tmp.push(data);
      data = tmp;
    }
    // turn sparse hash input into arrays with 0s as filler
    let datum = data[0].input;
    if (!Array.isArray(datum) && !(datum instanceof Float32Array)) {
      if (!this.inputLookup) {
        this.inputLookup = lookup.buildLookup(data.map(value => value['input']));
      }
      data = data.map(datum => {
        let array = lookup.toArray(this.inputLookup, datum.input);
        return Object.assign({}, datum, { input: array });
      }, this);
    }

    if (!Array.isArray(data[0].output)) {
      if (!this.outputLookup) {
        this.outputLookup = lookup.buildLookup(data.map(value => value['output']));
      }
      data = data.map(datum => {
        let array = lookup.toArray(this.outputLookup, datum.output);
        return Object.assign({}, datum, { output: array });
      }, this);
    }
    return data;
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

function calcChanges(previousChanges, deltas, previousOutputs, learningRate, momentum) {
  return (learningRate * deltas[this.thread.y] * previousOutputs[this.thread.x])
      + (momentum * previousChanges[this.thread.y][this.thread.x]);
}

function addWeights(change, weights){
  return change + weights[this.thread.y][this.thread.x];
}

function addBiases(biases, deltas, learningRate){
  return biases[this.thread.x] + (deltas[this.thread.x] * learningRate);
}

// mean squared error, reimplemented for GPU
function mse(errors) {
  let sum = 0;
  for (let i = 0; i < this.constants.size; i++) {
    sum += Math.pow(errors[i], 2);
  }
  return sum / this.constants.size;
}
import NeuralNetwork from './neural-network';
import lookup from './lookup';
import mse from './utilities/mse';
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
   * @param {} sizes
   * @param {Boolean} keepNetworkIntact
   */
  initialize(sizes, keepNetworkIntact) {
    super.initialize(sizes, keepNetworkIntact);
    this.buildRunInput();
    this.buildCalculateDeltas();
    this.buildGetChanges();
    this.buildChangeBiases();
  }

  setActivation() {}

  /**
   *
   * @param input
   * @param target
   * @param learningRate
   */
  trainPattern(input, target, learningRate) {
    learningRate = learningRate || this.learningRate;
    // forward propagate
    this.runInput(input);

    // backward propagate
    this.calculateDeltas(target);
    this.getChanges(learningRate);
    this.changeBiases(learningRate);

    return mse(this.errors[this.outputLayer].toArray(this.gpu));
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
      const kernel = this.gpu.createKernelMap({ weightedSum: GPU.alias('weightedSum', weightedSum) },
        function(weights, biases, inputs){
          return weightedSum(weights, biases, this.thread.x, inputs);
        }, {
        constants:{
          size: this.sizes[layer - 1]
        }
      })
      .setOutput([this.sizes[layer]])
      .setOutputToTexture(true);
      this.forwardPropagate[layer] = kernel;
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
      ).result;

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
        const kernel = this.gpu.createKernelMap({
          error: GPU.alias('calcError', calcError),
          deltas: GPU.alias('calcDeltas', calcDeltas)
        }, function(outputs, target){
          let output = outputs[this.thread.x];
          return calcDeltas(calcError(output, target), output);
      })
       .setOutput([this.sizes[layer]])
       .setOutputToTexture(true);
        
        this.backwardPropagate[layer] = kernel;

      } else {
        const kernel = this.gpu.createKernelMap({
          error: GPU.alias('calcErrorOutput', calcErrorOutput),
          deltas: GPU.alias('calcDeltas', calcDeltas),
        }, function(nextWeights, outputs, nextDeltas){
          let output = outputs[this.thread.x];
          return calcDeltas(calcErrorOutput(nextWeights, nextDeltas), output);
        }, {
          constants: {
            size: this.deltas[layer + 1].length
          }
        })
        .setOutput([this.sizes[layer]])
        .setOutputToTexture(true);

        this.backwardPropagate[layer] = kernel;
      }
    }
  }

  calculateDeltas(target,learningRate) {
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

      this.deltas[layer] = output.result; 
      this.errors[layer] = output.error;
    }
  }

  buildGetChanges() {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
     const kernel = this.gpu.createKernelMap({
         addWeights, calcChanges},
        function(previousOutputs, deltas, weights, changes, learningRate, momentum){
          let delta = deltas[this.thread.y];
          let change = calcChanges(
            changes, 
            delta, 
            previousOutputs, 
            learningRate, 
            momentum, 
            this.thread.x, 
            this.thread.y);

          return addWeights(change, weights, this.thread.x, this.thread.y);
        }, {
          constants:{
            size: this.outputs[layer - 1].length
          }
        })
          .setOutput([this.sizes[layer -1], this.sizes[layer]])
          .setOutputToTexture(true);
        
      this.changesPropagate[layer] = kernel;
    }    
  }
  
  getChanges(learningRate){
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      let output = this.changesPropagate[layer](
        this.outputs[layer - 1],
        this.deltas[layer],
        this.weights[layer],
        this.changes[layer],
        learningRate,
        this.momentum
      );
      
      this.changes[layer] = output.calcChanges;
      this.weights[layer] = output.result;
    }
  }

  buildChangeBiases() {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      const kernel = this.gpu.createKernelMap({
        addBiases
      }, function (biases, deltas, learningRate) {
        return addBiases(biases, deltas, learningRate, this.thread.x);
      })
        .setOutput([this.sizes[layer]])
        .setOutputToTexture(true);

      this.biasesPropagate[layer] = kernel;
    }
  }

  changeBiases(learningRate) {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      let output = this.biasesPropagate[layer](
        this.biases[layer],
        this.deltas[layer],
        learningRate
      );
      this.biases[layer] = output.result;
    }
  }

  /**
   *
   * @param input
   * @returns {*}
   */
  run(input) {
    if (this.inputLookup) {
      input = lookup.toArray(this.inputLookup, input);
    }
    let output = this.runInput(input);

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
  formatData(data) {
    if (data.constructor !== Array) { // turn stream datum into array
      let tmp = [];
      tmp.push(data);
      data = tmp;
    }
    // turn sparse hash input into arrays with 0s as filler
    let datum = data[0].input;
    if (datum.constructor !== Array && !(datum instanceof Float64Array)) {
      if (!this.inputLookup) {
        this.inputLookup = lookup.buildLookup(data.map(value => value['input']));
      }
      data = data.map(datum => {
        let array = lookup.toArray(this.inputLookup, datum.input);
        return Object.assign({}, datum, { input: array });
      }, this);
    }

    if (data[0].output.constructor !== Array) {
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

function weightedSumSigmoid(weights, biases, x, inputs) {
  let sum = biases[x];
  for (let k = 0; k < size; k++) {
    sum += weights[x][k] * inputs[k];
  }
  //sigmoid
  return 1 / (1 + Math.exp(-sum));
}

function weightedSumRelu(weights, biases, x, inputs) {
  let sum = biases[x];
  for (let k = 0; k < size; k++) {
    sum += weights[x][k] * inputs[k];
  }
  //relu
  return (sum < 0 ? 0 : sum);
}

function weightedSumLeakyRelu(weights, biases, x, inputs) {
  let sum = biases[x];
  for (let k = 0; k < size; k++) {
    sum += weights[x][k] * inputs[k];
  }
  //leaky relu
  return (sum < 0 ? 0 : 0.01 * sum);
}

function weightedSumTanh(weights, biases, x, inputs) {
  let sum = biases[x];
  for (let k = 0; k < size; k++) {
    sum += weights[x][k] * inputs[k];
  }
  //tanh
  return Math.tanh(sum);
}

function calcError(outputs, target) {
  return target[this.thread.x] - outputs;
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

function calcErrorOutput(nextWeights, nextDeltas){
  let error = 0;
  for(let k = 0; k < size; k++){
    error += nextDeltas[k] * nextWeights[k][this.thread.x];
  }
  return error;
}

function calcChanges(previousChange, deltas, previousOutputs, learningRate, momentum, x, y) {
  let sum = 0;
  for (let i = 0; i < this.constants.size; i++) {
    sum += (learningRate * deltas * previousOutputs[x])
      + (momentum * previousChange[y][i]);
  }
  return sum;
}

function addWeights(change, weights, x, y){
  return change + weights[y][x];
}

function addBiases(biases, deltas, learningRate, x){
  return biases[x] + (deltas[x] * learningRate);
}
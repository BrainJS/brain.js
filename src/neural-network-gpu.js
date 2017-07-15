import lookup from './lookup';
import TrainStream from './train-stream';
import max from './utilities/max';
import mse from './utilities/mse';
import randos from './utilities/randos';
import range from './utilities/range';
import toArray from './utilities/to-array';
import zeros from './utilities/zeros';
import GPU from 'gpu.js';

/**
 *
 * @param {object} options
 * @constructor
 */
export default class NeuralNetworkGPU {
  constructor(options = {}) {
    Object.assign(this, NeuralNetworkGPU.defaults, options);
    this.hiddenSizes = options.hiddenLayers;
    this.layers = null;
    this.sizes = null;
    this.outputLayer = null;
    this.biases = null; // weights for bias nodes
    this.weights = null;
    this.outputs = null;

    this.forwardPropagate = [];
    this.backwardPropagate = [];
    this.changesPropagate = [];
    this.weightsPropagate = [];
    this.biasesPropagate = [];
    this.weightsToFloat = [];
    this.megaKernel = [];
    // state for training
    this.deltas = null;
    this.changes = null; // for momentum
    this.errors = null;
    this.count = 0;
    this.error = 1;
    this.logCount = 200
    this.gpu = new GPU({mode: 'gpu'});
  }

  /**
   *
   * @param {} sizes
   * @param {Boolean} keepNetworkIntact
   */
  initialize(sizes, keepNetworkIntact) {
    this.sizes = sizes;
    this.outputLayer = this.sizes.length - 1;

    if (!keepNetworkIntact) {
      this.biases = []; // weights for bias nodes
      this.weights = [];
      this.outputs = [];
    }

    // state for training
    this.changes = []; // for momentum
    this.deltas = [];
    this.errors = [];

    for (let layer = 0; layer <= this.outputLayer; layer++) {
      let size = this.sizes[layer];
      this.deltas[layer] = zeros(size);
      this.errors[layer] = zeros(size);
      if (!keepNetworkIntact) {
        this.outputs[layer] = zeros(size);
      }

      if (layer > 0) {
        this.biases[layer] = randos(size);

        if (!keepNetworkIntact) {
          this.weights[layer] = new Array(size);
        }
        this.changes[layer] = new Array(size);

        for (let node = 0; node < size; node++) {
          let prevSize = this.sizes[layer - 1];
          if (!keepNetworkIntact) {
            this.weights[layer][node] = randos(prevSize);
          }
          this.changes[layer][node] = zeros(prevSize);
        }
      }
    }
    this.buildRunInput();
    this.buildCalculateDeltas();
    this.buildGetChanges();
    this.buildChangeBiases();
  }


  /**
   *
   * @param data
   * @param options
   * @returns {{error: number, iterations: number}}
   */
  train(data, _options = {}) {
    const options = Object.assign({}, NeuralNetworkGPU.trainDefaults, _options);
    data = this.formatData(data);
    let iterations = options.iterations;
    let errorThresh = options.errorThresh;
    let log = options.log === true ? console.log : options.log;
    let logPeriod = options.logPeriod;
    let learningRate = _options.learningRate || this.learningRate || options.learningRate;
    let callback = options.callback;
    let callbackPeriod = options.callbackPeriod;
    let sizes = [];
    let inputSize = data[0].input.length;
    let outputSize = data[0].output.length;
    let hiddenSizes = this.hiddenSizes;
    if (!hiddenSizes) {
      sizes.push(Math.max(3, Math.floor(inputSize / 2)));
    } else {
      hiddenSizes.forEach(size => {
        sizes.push(size);
      });
    }

    sizes.unshift(inputSize);

    sizes.push(outputSize);

    this.initialize(sizes, options.keepNetworkIntact);

    let error = 1;
    let i;
    for (i = 1; i < iterations && error > errorThresh; i++) {
      this.count++;
      let sum = 0;
      for (let j = 0; j < data.length; j++) {
        let err = this.trainPattern(data[j].input, data[j].output, learningRate);
        sum += err;
      }
      
      error = sum / data.length;

      if (log && (i % this.logCount == 0) || log && i == 1) {
        log('iterations:', i, 'training error:', error);
      }
      if (callback && (i % callbackPeriod == 0)) {
        callback({ error: error, iterations: i });
      }
    
    this.error = error;
    }
    return {
      error: error,
      iterations: i
    };
  }

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
    
    if (this.count % this.logCount == 0 || this.count == 1 || this.iterations == this.count) {
      for (let i = 0; i < this.errors.length; i++) {
        this.errors[i] = this.errors[i].toArray
          ? this.errors[i].toArray(this.gpu)
          : this.errors[i];
      }
      let error = this.error = mse(this.errors[this.outputLayer]);
      return error;
    } else {
      return this.error;
    }
  }

  buildRunInput() {
    function weightedSum(weights, biases, x, inputs) {
      var sum = biases[x];
      for (var k = 0; k < size; k++) {
        sum += weights[x][k] * inputs[k];
      }
      return 1 / (1 + Math.exp(-sum));
    }

    for(var layer = 1; layer <= this.outputLayer; layer++){
      const kernel = this.gpu.createKernelMap({weightedSum}, 
        function(weights, biases, inputs){
          return weightedSum(weights, biases, this.thread.x, inputs);
        }, {
        constants:{
          size: this.sizes[layer - 1]
        }
      })
      .setDimensions([this.sizes[layer]])
      .setOutputToTexture(true);
      this.forwardPropagate[layer] = kernel;
    }
  }

  /**
   *
   * @param input
   * @returns {*}
   */
  runInput(input){
    let output;
    this.outputs[0] = input;
    for (var layer = 1; layer <= this.outputLayer; layer++) {
      this.outputs[layer] = this.forwardPropagate[layer](
        this.weights[layer], 
        this.biases[layer], 
        input
      ).result;

      output = input = this.outputs[layer];
    }
      // console.log(this.outputs[2], 'Outputs')
    return output;
  }

  buildCalculateDeltas(target){

    function calcError(outputs, target) {
      return target[this.thread.x] - outputs;
    }

    function calcDeltas(error, output) {
      return error * output * (1 - output);
    }

    function calcErrorOutput(nextWeights, nextDeltas){
      var error = 0;
      for(var k = 0; k < size; k++){
        error += nextDeltas[k] * nextWeights[k][this.thread.x];
      }
      return error;
    }

    for(var layer = this.outputLayer; layer > 0; layer--){
      if(layer == this.outputLayer){
        const kernel = this.gpu.createKernelMap({
          error: calcError,
          deltas: calcDeltas
        }, function(outputs, target){
          var output = outputs[this.thread.x];
          return calcDeltas(calcError(output, target), output);
      })
       .setDimensions([this.sizes[layer]]) 
       .setOutputToTexture(true);
        
        this.backwardPropagate[layer] = kernel;

      }else{
        const kernel = this.gpu.createKernelMap({
          error: calcErrorOutput,
          deltas: calcDeltas,
        }, function(nextWeights, outputs, nextDeltas){
          var output = outputs[this.thread.x];
          return calcDeltas(calcErrorOutput(nextWeights, nextDeltas), output);
        }, {
          constants: {
            size: this.deltas[layer + 1].length
          }
        })
        .setDimensions([this.sizes[layer]])
        .setOutputToTexture(true);
        
        this.backwardPropagate[layer] = kernel;
      }
    }
  }

  calculateDeltas(target,learningRate){
    for (var layer = this.outputLayer; layer > 0; layer--) {
      let output;
      if(layer == this.outputLayer){
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
      // console.log(this.errors[2], 'errors');
      // console.log(this.deltas[2], 'deltas');
  }

  buildGetChanges(){
    function calcChanges(previousChange, deltas, previousOutputs, learningRate, momentum, x, y) {
      var sum = 0;
      for (var i = 0; i < size; i++) {
        sum += (learningRate * deltas * previousOutputs[x])
                + (momentum * previousChange[y][i]);
      }
      return sum;
    }

    function addWeights(change, weights, x, y){
      return change + weights[y][x];
    }

    for (let layer = 1; layer <= this.outputLayer; layer++) {
     const kernel = this.gpu.createKernelMap({addWeights, calcChanges},
        function(previousOutputs, deltas, weights, changes, learningRate, momentum){
          var delta = deltas[this.thread.y];
          var change = calcChanges(
            changes, 
            delta, 
            previousOutputs, 
            learningRate, 
            momentum, 
            this.thread.x, 
            this.thread.y);

          return addWeights(change, weights, this.thread.x, this.thread.y);
        },{
          constants:{
            size: this.outputs[layer - 1].length
          }
        })
          .setDimensions([this.sizes[layer -1], this.sizes[layer]])
          .setOutputToTexture(true)
        
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
      // console.log(this.weights[1][0], 'weights');
      // console.log(this.changes[1][0], 'changes');
    
  }

  buildChangeBiases() {
    function addBiases(biases, deltas, learningRate, x){
      return biases[x] + (deltas[x] * learningRate);
    }
    
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      const kernel = this.gpu.createKernelMap({
        addBiases
      }, function (biases, deltas, learningRate) {
        return addBiases(biases, deltas, learningRate, this.thread.x);
      })
        .setDimensions([this.sizes[layer]])
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
    // console.log(this.biases[2], 'biases')
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

}

NeuralNetworkGPU.trainDefaults = {
  iterations: 20000,
  errorThresh: 0.005,
  log: false,
  logPeriod: 10,
  learningRate: 0.3,
  callback: null,
  callbackPeriod: 10,
  keepNetworkIntact: false
};

NeuralNetworkGPU.defaults = {
  learningRate: 0.3,
  momentum: 0.1,
  binaryThresh: 0.5,
  hiddenLayers: null
};
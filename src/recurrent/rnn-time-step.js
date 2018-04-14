import Matrix from './matrix';
import RandomMatrix from './matrix/random-matrix';
import Equation from './matrix/equation';
import sampleI from './matrix/sample-i';
import maxI from './matrix/max-i';
import softmax from './matrix/softmax';
import copy from './matrix/copy';
import { randomF } from '../utilities/random';
import zeros from '../utilities/zeros';
import DataFormatter from '../utilities/data-formatter';
import RNN from './rnn';

export default class RNNTimeStep extends RNN {
  createInputMatrix() {
    //0 is end, so add 1 to offset
    this.model.input = new RandomMatrix(1, this.inputSize, 0.08);
  }

  createOutputMatrix() {
    let model = this.model;
    let outputSize = this.outputSize;
    let lastHiddenSize = this.hiddenSizes[this.hiddenSizes.length - 1];

    //whd
    model.outputConnector = new RandomMatrix(outputSize, lastHiddenSize, 0.08);
    //bd
    model.output = new Matrix(outputSize, 1);
  }

  bindEquation() {
    let model = this.model;
    let hiddenSizes = this.hiddenSizes;
    let hiddenLayers = model.hiddenLayers;
    let equation = new Equation();
    let outputs = [];
    let equationConnection = model.equationConnections.length > 0
      ? model.equationConnections[model.equationConnections.length - 1]
      : this.initialLayerInputs
      ;

      // 0 index
    let output = this.getEquation(equation, equation.input(model.input), equationConnection[0], hiddenLayers[0]);
    outputs.push(output);
    // 1+ indices
    for (let i = 1, max = hiddenSizes.length; i < max; i++) {
      output = this.getEquation(equation, output, equationConnection[i], hiddenLayers[i]);
      outputs.push(output);
    }

    model.equationConnections.push(outputs);
    equation.add(equation.multiply(model.outputConnector, output), model.output);
    model.equations.push(equation);
  }

  /**
   *
   * @param {Number[]} input
   * @returns {number}
   */
  runInput(input) {
    this.runs++;
    let model = this.model;
    let errorSum = 0;
    let equation;
    while (model.equations.length < input.length - 1) {
      this.bindEquation();
    }
    const outputs = [];
    for (let inputIndex = 0, max = input.length - 1; inputIndex < max; inputIndex++) {
      // start and end tokens are zeros
      equation = model.equations[inputIndex];

      const current = input[inputIndex];
      const next = input[inputIndex + 1];
      const output = equation.runInput(current);
      const error = output.weights[0] - next;

      // set gradients into log probabilities
      errorSum += Math.abs(error);

      // write gradients into log probabilities
      output.deltas[0] = error;
      outputs.push(output.weights[0]);
    }

    //this.model.equations.length - 1;
    this.totalCost = errorSum;
    return errorSum;
  }

  runBackpropagate() {
    for (let i = this.model.equations.length - 1; i > -1; i--) {
      this.model.equations[i].runBackpropagate();
    }
  }


  /**
   *
   * @param {Number[]|*} [rawInput]
   * @param {Number} [maxPredictionLength]
   * @param {Boolean} [isSampleI]
   * @param {Number} temperature
   * @returns {*}
   */
  run(input = [], maxPredictionLength = 1, isSampleI = false, temperature = 1) {
    if (!this.isRunnable) return null;
    const model = this.model;
    while (model.equations.length < maxPredictionLength) {
      this.bindEquation();
    }
    let lastOutput;
    for (let i = 0; i < input.length; i++) {
      let outputMatrix = model.equations[i].runInput(input[i]);
      lastOutput = outputMatrix.weights[0];
    }
    return lastOutput;
  }

  /**
   *
   * @returns {Function}
   */
  toFunction() {
    throw new Error('not implemented');
  }
}

RNNTimeStep.defaults = {
  inputSize: 1,
  hiddenSizes:[20],
  outputSize: 1,
  learningRate: 0.01,
  decayRate: 0.999,
  smoothEps: 1e-8,
  regc: 0.000001,
  clipval: 5,
  json: null,
  dataFormatter: null
};

RNNTimeStep.trainDefaults = RNN.trainDefaults;
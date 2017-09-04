'use strict';

import Base from './base';
import makeKernel from '../utilities/make-kernel';

export default class Sigmoid extends Base {
  setupKernels() {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height, this.depth],
      functions: [sigmoid]
    });

    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height, this.depth],
      map: {
        errors: calcError,
        deltas: calcDeltas
      }
    });

    this.learnKernel = makeKernel(learn, {
      output: [this.width, this.height, this.depth],
      map: {
        weights: calcWeights,
        changes: calcChanges
      }
    });
  }

  predict(inputs, x) {
    this.outputs = this.predictKernel(inputs, x, this.weights, this.biases);
  }

  compare() {
    const output = this.compareKernel(this.outputs, this.nextLayer.weights, this.nextLayer.deltas);
    this.errors = output.errors;
    this.deltas = output.deltas;
  }

  learn() {
    const output = this.learnKernel(
      this.deltas,
      this.weights,
      this.previousLayer.outputs,
      this.previousLayer.changes,
      learningRate,
      momentum
    );
    this.weights = output.weights;
    this.changes = output.changes;
  }
}

function predict(inputs, x, weights, biases) {
  let sum = biases[x];
  for (let k = 0; k < this.output.y; k++) {
    sum += weights[x][k] * inputs[k];
  }
  return sigmoid(sum);
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function compare(outputs, nextLayerWeights, nextLayerDeltas) {
  let output = outputs[this.thread.x];
  return calcDeltas(output, calcError(nextLayerWeights, nextLayerDeltas));
}

function calcDeltas(output, error) {
  return error * output * (1 - output);
}

function calcError(nextWeights, nextDeltas) {
  let error = 0;
  for(let k = 0; k < this.output.x; k++){
    error += nextDeltas[k] * nextWeights[k][this.thread.x];
  }
  return error;
}

function learn(deltas, weights, previousLayerOutputs, previousLayerChanges, learningRate, momentum) {
  const delta = deltas[this.thread.y];
  const change = calcChanges(
    previousLayerChanges,
    delta,
    previousLayerOutputs,
    learningRate,
    momentum
  );

  return calcWeights(change, weights);
}

function calcChanges(previousChanges, delta, previousOutputs, learningRate, momentum) {
  let sum = 0;
  for (let i = 0; i < this.output.x; i++) {
    sum += (learningRate * delta * previousOutputs[this.thread.x])
      + (momentum * previousChanges[this.thread.y][i]);
  }
  return sum;
}

function calcWeights(change, weights) {
  return change + weights[this.thread.y][this.thread.x];
}
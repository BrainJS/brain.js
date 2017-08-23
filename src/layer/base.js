'use strict';

export default class BaseLayer {
  constructor(inputLayer, settings) {
    //layers
    this.inputLayer = inputLayer;
    this.nextLayer = null;
    this.previousLayer = null;

    //size
    this.width = settings.width;
    this.height = settings.height;
    this.depth = settings.width;

    //methods
    this.predictKernel = null;
    this.compareKernel = null;
    this.learnKernel = null;

    //what matters :P
    this.outputs = null;
    this.errors = null;
    this.deltas = null;
    this.weights = null;
    this.changes = null;
  }

  setNextLayer(nextLayer) {
    this.nextLayer = nextLayer;
  }

  setPreviousLayer(previousLayer) {
    this.previousLayer = previousLayer;
  }

  setupKernels() {
    throw new Error('setupKernels not implemented on BaseLayer');
  }

  predict() {
    throw new Error('predict not implemented on BaseLayer');
  }

  compare() {
    throw new Error('compare not implemented on BaseLayer');
  }

  learn() {
    throw new Error('learn not implemented on BaseLayer');
  }

  toArray() {
    return this.outputs.toArray();
  }
}
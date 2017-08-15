'use strict';

export default class BaseLayer {
  constructor() {
    this.output = null;
    this.nextLayer = null;
    this.previousLayer = null;
  }

  setNextLayer(nextLayer) {
    this.nextLayer = nextLayer;
  }

  setPreviousLayer(previousLayer) {
    this.previousLayer = previousLayer;
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
    return this.output.toArray();
  }
}
import { Modifier } from './types';
import { makeKernel, clear } from '../utilities/kernel';
import { ILayer } from './base-layer';
import { IKernelFunctionThis } from 'gpu.js';

export function predict(this: IKernelFunctionThis, value: number[][]): number {
  return value[this.thread.x][this.thread.y];
}

const compare = predict;

export class Transpose extends Modifier {
  inputLayer: ILayer;

  get width(): number {
    return this.inputLayer.height;
  }

  get height(): number {
    return this.inputLayer.width;
  }

  constructor(inputLayer: ILayer) {
    super();
    this.inputLayer = inputLayer;
    this.validate();
  }

  setupKernels(): void {
    this.predictKernel = makeKernel(predict, {
      output: [this.height, this.width],
    });
    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height],
    });
  }

  predict(): void {
    this.weights = this.predictKernel(this.inputLayer.weights);
    clear(this.deltas);
  }

  compare() {
    // TODO: needs switched to this.compareKernel?
    this.inputLayer.deltas = this.predictKernel(this.deltas);
  }
}

export function transpose(inputLayer: ILayer): Transpose {
  return new Transpose(inputLayer);
}

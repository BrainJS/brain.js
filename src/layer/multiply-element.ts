import { makeKernel, release, clear } from '../utilities/kernel';
import { Operator } from './operator';
import { checkSameSize } from '../utilities/layer-size';
import { ILayer, ILayerSettings } from './base-layer';
import { IKernelFunctionThis, IKernelRunShortcut } from 'gpu.js';

export function predict(
  this: IKernelFunctionThis,
  inputLayerWeights1: number[][],
  inputLayerWeights2: number[][]
): number {
  return (
    inputLayerWeights1[this.thread.y][this.thread.x] *
    inputLayerWeights2[this.thread.y][this.thread.x]
  );
}

export function compare(
  this: IKernelFunctionThis,
  weights: number[][],
  deltas: number[][]
): number {
  return (
    weights[this.thread.y][this.thread.x] * deltas[this.thread.y][this.thread.x]
  );
}

export class MultiplyElement extends Operator {
  get width(): number {
    return this.inputLayer1.width;
  }

  get height(): number {
    return this.inputLayer1.height;
  }

  get depth(): number {
    return this.inputLayer1.depth;
  }

  validate(): void {
    super.validate();
    checkSameSize(this.inputLayer1, this.inputLayer2);
  }

  setupKernels(): void {
    this.predictKernel = makeKernel(predict, {
      output: [this.width, this.height],
      immutable: true,
    });

    this.compareKernel = makeKernel(compare, {
      output: [this.width, this.height],
      immutable: true,
    });
  }

  predict(): void {
    release(this.weights);
    this.weights = (this.predictKernel as IKernelRunShortcut)(
      this.inputLayer1.weights,
      this.inputLayer2.weights
    );
  }

  compare(): void {
    release(this.inputLayer1.deltas);
    release(this.inputLayer2.deltas);
    this.inputLayer1.deltas = (this.compareKernel as IKernelRunShortcut)(
      this.inputLayer2.weights,
      this.deltas
    );
    this.inputLayer2.deltas = (this.compareKernel as IKernelRunShortcut)(
      this.inputLayer1.weights,
      this.deltas
    );
  }
}

export function multiplyElement(
  inputLayer1: ILayer,
  inputLayer2: ILayer,
  settings?: ILayerSettings
): MultiplyElement {
  return new MultiplyElement(inputLayer1, inputLayer2, settings);
}

import { IKernelFunctionThis, IKernelRunShortcut } from 'gpu.js';

import { Activation } from './activation';
import { activate, measure } from '../activation/tanh';
import { release, makeKernel } from '../utilities/kernel';
import { ILayer, ILayerSettings } from './base-layer';

export function predict2D(
  this: IKernelFunctionThis,
  inputs: number[][]
): number {
  return activate(inputs[this.thread.y][this.thread.x]);
}

export function predict3D(
  this: IKernelFunctionThis,
  inputs: number[][][]
): number {
  return activate(inputs[this.thread.z][this.thread.y][this.thread.x]);
}

export function compare2D(
  this: IKernelFunctionThis,
  weights: number[][],
  errors: number[][]
): number {
  return measure(
    weights[this.thread.y][this.thread.x],
    errors[this.thread.y][this.thread.x]
  );
}

export function compare3D(
  this: IKernelFunctionThis,
  weights: number[][][],
  errors: number[][][]
): number {
  return measure(
    weights[this.thread.z][this.thread.y][this.thread.x],
    errors[this.thread.z][this.thread.y][this.thread.x]
  );
}

export class Tanh extends Activation {
  setupKernels(): void {
    if (this.depth > 0) {
      this.predictKernel = makeKernel(predict3D, {
        output: [this.width, this.height, this.depth],
        functions: [activate],
        immutable: true,
      });

      this.compareKernel = makeKernel(compare3D, {
        output: [this.width, this.height, this.depth],
        functions: [measure],
        immutable: true,
      });
    } else {
      this.predictKernel = makeKernel(predict2D, {
        output: [this.width, this.height],
        functions: [activate],
        immutable: true,
      });

      this.compareKernel = makeKernel(compare2D, {
        output: [this.width, this.height],
        functions: [measure],
        immutable: true,
      });
    }
  }

  predict(): void {
    release(this.weights);
    this.weights = (this.predictKernel as IKernelRunShortcut)(
      this.inputLayer.weights
    );
  }

  compare(): void {
    release(this.inputLayer.deltas);
    this.inputLayer.deltas = (this.compareKernel as IKernelRunShortcut)(
      this.weights,
      this.deltas
    );
  }
}

export function tanh(inputLayer: ILayer, settings?: ILayerSettings): Tanh {
  return new Tanh(inputLayer, settings);
}

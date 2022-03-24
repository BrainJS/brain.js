import { Activation } from './types';
import { makeKernel, release } from '../utilities/kernel';
import { activate, measure } from '../activation/leaky-relu';
import { IKernelFunctionThis, IKernelRunShortcut } from 'gpu.js';
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
  deltas: number[][]
): number {
  return measure(
    weights[this.thread.y][this.thread.x],
    deltas[this.thread.y][this.thread.x]
  );
}

export function compare3D(
  this: IKernelFunctionThis,
  weights: number[][][],
  deltas: number[][][]
): number {
  return measure(
    weights[this.thread.z][this.thread.y][this.thread.x],
    deltas[this.thread.z][this.thread.y][this.thread.x]
  );
}

export class LeakyRelu extends Activation {
  setupKernels(): void {
    const { width, height, depth } = this.inputLayer;
    if (this.depth > 0) {
      this.predictKernel = makeKernel(predict3D, {
        output: [width, height, depth],
        functions: [activate],
        immutable: true,
      });

      this.compareKernel = makeKernel(compare3D, {
        output: [width, height, depth],
        functions: [measure],
        immutable: true,
      });
    } else {
      this.predictKernel = makeKernel(predict2D, {
        output: [width, height],
        functions: [activate],
        immutable: true,
      });

      this.compareKernel = makeKernel(compare2D, {
        output: [width, height],
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
    const { deltas } = this;
    this.deltas = (this.compareKernel as IKernelRunShortcut)(
      this.weights,
      deltas
    );
    release(deltas);
  }
}

export function leakyRelu(
  inputLayer: ILayer,
  settings: ILayerSettings
): LeakyRelu {
  return new LeakyRelu(inputLayer, settings);
}

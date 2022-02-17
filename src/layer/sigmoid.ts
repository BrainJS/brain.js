import { ILayer, ILayerSettings } from './base-layer';
import { IKernelFunctionThis, IKernelRunShortcut } from 'gpu.js';

import { Activation } from './types';
import { makeKernel, release, clear } from '../utilities/kernel';
import { activate, measure } from '../activation/sigmoid';

export function predict2D(
  this: IKernelFunctionThis,
  inputs: number[][]
): number {
  return 1 / (1 + Math.exp(-inputs[this.thread.y][this.thread.x]));
}

export function predict3D(
  this: IKernelFunctionThis,
  inputs: number[][][]
): number {
  return (
    1 / (1 + Math.exp(-inputs[this.thread.z][this.thread.y][this.thread.x]))
  );
}

export function compare2D(
  this: IKernelFunctionThis,
  weights: number[][],
  deltas: number[][]
): number {
  const weight = weights[this.thread.y][this.thread.x];
  const delta = deltas[this.thread.y][this.thread.x];
  return weight * (1 - weight) * delta;
}

export function compare3D(
  this: IKernelFunctionThis,
  weights: number[][][],
  deltas: number[][][]
): number {
  const weight = weights[this.thread.z][this.thread.y][this.thread.x];
  const delta = deltas[this.thread.z][this.thread.y][this.thread.x];
  return weight * (1 - weight) * delta;
}

export class Sigmoid extends Activation {
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

export function sigmoid(
  inputLayer: ILayer,
  settings?: ILayerSettings
): Sigmoid {
  return new Sigmoid(inputLayer, settings);
}

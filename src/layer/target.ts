import { IKernelFunctionThis, IKernelRunShortcut, KernelOutput } from 'gpu.js';

import { makeKernel, release, clone } from '../utilities/kernel';
import { zeros } from '../utilities/zeros';
import { zeros2D } from '../utilities/zeros-2d';
import { BaseLayer, ILayer, ILayerSettings } from './base-layer';

export function compare1D(
  this: IKernelFunctionThis,
  weights: number[][],
  targetValues: number[]
): number {
  return weights[this.thread.y][this.thread.x] - targetValues[this.thread.x];
}

export function compare2D(
  this: IKernelFunctionThis,
  weights: number[][],
  targetValues: number[][]
): number {
  return (
    weights[this.thread.y][this.thread.x] -
    targetValues[this.thread.y][this.thread.x]
  );
}

export type TargetType = new (
  settings: Partial<ILayerSettings>,
  inputLayer: ILayer
) => ILayer;

export class Target extends BaseLayer {
  errors: KernelOutput;
  inputLayer: ILayer;
  constructor(settings: Partial<ILayerSettings>, inputLayer: ILayer) {
    super(settings);
    this.inputLayer = inputLayer;
    this.validate();
    if (this.depth) {
      throw new Error('Target layer not implemented for depth');
    } else if (this.height) {
      this.weights = zeros2D(this.width, this.height);
      this.deltas = zeros2D(this.width, this.height);
      this.errors = zeros2D(this.width, this.height);
    } else {
      this.weights = zeros(this.width);
      this.deltas = zeros(this.width);
      this.errors = zeros(this.width);
    }
  }

  setupKernels(): void {
    if (this.width === 1) {
      this.compareKernel = makeKernel(compare1D, {
        output: [this.width, this.height],
        immutable: true,
      });
    } else {
      this.compareKernel = makeKernel(compare2D, {
        output: [this.width, this.height],
        immutable: true,
      });
    }
  }

  predict(): void {
    // TODO: should we clone here?
    // NOTE: this looks like it shouldn't be, but the weights are immutable, and this is where they are reused.
    release(this.weights);
    this.weights = clone(this.inputLayer.weights as KernelOutput);
  }

  compare(targetValues: KernelOutput): void {
    // this is where weights attach to deltas
    // deltas will be zero on learn, so save it in error for comparing to mse later
    release(this.deltas);
    release(this.errors);
    release(this.inputLayer.deltas);
    this.deltas = (this.compareKernel as IKernelRunShortcut)(
      this.weights,
      targetValues
    );
    this.inputLayer.deltas = clone(this.deltas);
    this.errors = clone(this.deltas);
  }

  setupPraxis(): void {}
}

export function target(settings: ILayerSettings, inputLayer: ILayer): Target {
  return new Target(settings, inputLayer);
}
